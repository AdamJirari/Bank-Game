# Base image - swap for your DB-internal JDK 8 image as needed
FROM registry.access.redhat.com/ubi8/openjdk-8

USER 0

# nginx + envsubst, that's it
RUN microdnf install -y nginx gettext && \
    microdnf clean all && \
    chgrp -R 0 /var/log/nginx /var/lib/nginx && \
    chmod -R g+rwX /var/log/nginx /var/lib/nginx && \
    mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi && \
    chgrp -R 0 /tmp && chmod -R g+rwX /tmp

# nginx config baked into the image at build time.
# Single-quoted delimiter ('NGINXEOF') prevents shell from touching $vars -
# nginx's own $uri / $http_authorization / $proxy_host stay literal,
# and ${VERTEX_URL} is substituted at container start (see CMD below).
RUN cat > /etc/nginx/nginx.conf.template <<'NGINXEOF'
worker_processes 1;
error_log  /tmp/nginx-error.log warn;
pid        /tmp/nginx.pid;

events {
  worker_connections 1024;
}

http {
  client_body_temp_path /tmp/client_body;
  proxy_temp_path       /tmp/proxy;
  fastcgi_temp_path     /tmp/fastcgi;
  uwsgi_temp_path       /tmp/uwsgi;
  scgi_temp_path        /tmp/scgi;
  access_log            /tmp/nginx-access.log;

  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;
  client_max_body_size 5m;

  server {
    listen       8080;
    server_name  _;

    root /opt/app/dist;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location = /api/vertex {
      proxy_pass               ${VERTEX_URL};
      proxy_http_version       1.1;
      proxy_set_header Host              $proxy_host;
      proxy_set_header Authorization     $http_authorization;
      proxy_set_header Content-Type      $http_content_type;
      proxy_pass_request_body  on;
      proxy_ssl_server_name    on;
      proxy_connect_timeout    30s;
      proxy_send_timeout       60s;
      proxy_read_timeout       60s;
    }
  }
}
NGINXEOF

# Pre-built static site (run ./build.sh locally before pushing / uploading)
COPY dist/ /opt/app/dist/

USER 1001
EXPOSE 8080

ENV VERTEX_URL=""

# Entrypoint logic inlined - validates VERTEX_URL, renders config, starts nginx
CMD test -n "$VERTEX_URL" || { echo 'ERROR: VERTEX_URL env var not set on the Deployment'; exit 1; }; \
    envsubst '$VERTEX_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
    echo "Starting nginx; proxying /api/vertex -> $VERTEX_URL" && \
    exec nginx -g 'daemon off;'

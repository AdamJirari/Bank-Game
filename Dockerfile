FROM <JDK8 base image>

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_API_KEY

# nginx for serving + envsubst (from gettext) for rendering ${VERTEX_URL} at start
RUN yum -y install nginx gettext && yum clean all

ENV WEB_ROOT=/usr/share/nginx/html
RUN mkdir -p ${WEB_ROOT}

# Pull the pre-built site from Artifactory
RUN curl -fSL \
    -u ${ARTIFACTORY_USER}:${ARTIFACTORY_API_KEY} \
    https://artifactory.intranet.db.com/artifactory/mvn-public-local/galileo-payment-analyzer/dist.tar \
    -o /tmp/dist.tar \
 && mkdir -p /tmp/ui \
 && tar -xf /tmp/dist.tar -C /tmp/ui \
 && cp -R /tmp/ui/dist/galileo-payment-analyzer/* ${WEB_ROOT}/ \
 && rm -rf /tmp/dist.tar /tmp/ui

# nginx config TEMPLATE - ${VERTEX_URL} stays literal here (single-quoted lines)
# and is substituted at container start by envsubst in the CMD below.
RUN printf '%s\n' \
    'worker_processes 1;' \
    'pid /tmp/nginx.pid;' \
    'error_log /tmp/nginx-error.log warn;' \
    'events { worker_connections 1024; }' \
    'http {' \
    '  client_body_temp_path /tmp/client_body;' \
    '  proxy_temp_path       /tmp/proxy;' \
    '  fastcgi_temp_path     /tmp/fastcgi;' \
    '  uwsgi_temp_path       /tmp/uwsgi;' \
    '  scgi_temp_path        /tmp/scgi;' \
    '  access_log            /tmp/nginx-access.log;' \
    '  include       /etc/nginx/mime.types;' \
    '  default_type  application/octet-stream;' \
    '  sendfile on;' \
    '  client_max_body_size 5m;' \
    '  server {' \
    '    listen 8080;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location / {' \
    '      try_files $uri $uri/ /index.html;' \
    '    }' \
    '    location = /api/vertex {' \
    '      proxy_pass              ${VERTEX_URL};' \
    '      proxy_http_version      1.1;' \
    '      proxy_set_header Host           $proxy_host;' \
    '      proxy_set_header Authorization  $http_authorization;' \
    '      proxy_set_header Content-Type   $http_content_type;' \
    '      proxy_pass_request_body on;' \
    '      proxy_ssl_server_name   on;' \
    '      proxy_connect_timeout   30s;' \
    '      proxy_send_timeout      60s;' \
    '      proxy_read_timeout      60s;' \
    '    }' \
    '  }' \
    '}' \
    > /etc/nginx/nginx.conf.template

EXPOSE 8080

# Render the template with the runtime VERTEX_URL, then exec nginx
CMD test -n "$VERTEX_URL" || { echo 'ERROR: VERTEX_URL env var not set on the Deployment'; exit 1; }; \
    envsubst '$VERTEX_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
    echo "nginx starting; /api/vertex -> $VERTEX_URL" && \
    exec nginx -g 'daemon off;'

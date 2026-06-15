const endpointEl = document.getElementById('endpoint');
const tokenEl = document.getElementById('token');
const bodyEl = document.getElementById('body');
const responseEl = document.getElementById('response');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  if (!endpoint) {
    responseEl.value = 'Please enter an endpoint URL.';
    return;
  }

  sendBtn.disabled = true;
  responseEl.value = 'Sending...';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: bodyEl.value
    });

    const text = await res.text();
    responseEl.value = `Status: ${res.status} ${res.statusText}\n\n${text}`;
  } catch (e) {
    responseEl.value =
      'Error: ' +
      e.message +
      '\n\nIf this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).';
  } finally {
    sendBtn.disabled = false;
  }
});

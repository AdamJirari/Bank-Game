const endpointEl = document.getElementById('endpoint');
const tokenEl = document.getElementById('token');
const bodyEl = document.getElementById('body');
const responseEl = document.getElementById('response');
const extractedEl = document.getElementById('extracted');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  if (!endpoint) {
    responseEl.value = 'Please enter an endpoint URL.';
    return;
  }

  sendBtn.disabled = true;
  responseEl.value = 'Sending...';
  extractedEl.value = '';

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

    try {
      const data = JSON.parse(text);
      extractedEl.value = data.response ?? '';
    } catch {
      extractedEl.value = '';
    }
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

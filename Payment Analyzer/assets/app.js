const endpointEl = document.getElementById('endpoint');
const tokenEl = document.getElementById('token');
const bodyEl = document.getElementById('body');
const responseEl = document.getElementById('response');
const extractedEl = document.getElementById('extracted');
const formattedEl = document.getElementById('formatted');
const sendBtn = document.getElementById('sendBtn');

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return html;
}

function renderBlock(block) {
  const lines = block.split('\n');

  const headingMatch = lines.length === 1 && lines[0].match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    return `<h${level}>${renderInline(headingMatch[2])}</h${level}>`;
  }

  if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
    const items = lines.map((l) => `<li>${renderInline(l.replace(/^\s*[-*]\s+/, ''))}</li>`);
    return `<ul>${items.join('')}</ul>`;
  }

  if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
    const items = lines.map((l) => `<li>${renderInline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`);
    return `<ol>${items.join('')}</ol>`;
  }

  return `<p>${lines.map(renderInline).join('<br>')}</p>`;
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map(renderBlock)
    .join('\n');
}

sendBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  if (!endpoint) {
    responseEl.value = 'Please enter an endpoint URL.';
    return;
  }

  sendBtn.disabled = true;
  responseEl.value = 'Sending...';
  extractedEl.value = '';
  formattedEl.innerHTML = '';

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
      const extracted = data.response ?? '';
      extractedEl.value = extracted;
      formattedEl.innerHTML = renderMarkdown(extracted);
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

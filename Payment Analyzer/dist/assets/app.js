const endpointEl = document.getElementById('endpoint');
const tokenEl = document.getElementById('token');
const promptEl = document.getElementById('prompt');
const temperatureEl = document.getElementById('temperature');
const temperatureValueEl = document.getElementById('temperatureValue');
const sysInstructionSelectEl = document.getElementById('sysInstructionSelect');
const sysInstructionTextEl = document.getElementById('sysInstructionText');
const sysInstructionPanelEl = document.getElementById('sysInstructionPanel');
const newInstructionBtn = document.getElementById('newInstructionBtn');
const showInstructionBtn = document.getElementById('showInstructionBtn');
const saveInstructionBtn = document.getElementById('saveInstructionBtn');
const deleteInstructionBtn = document.getElementById('deleteInstructionBtn');
const formattedEl = document.getElementById('formatted');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

// ---------------------------------------------------------------------
// Settings (endpoint + bearer token), persisted in localStorage
// ---------------------------------------------------------------------
const SETTINGS_KEY = 'paymentAnalyzer.settings';

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved) {
      endpointEl.value = saved.endpoint || '';
      tokenEl.value = saved.token || '';
    }
  } catch {
    /* ignore invalid saved settings */
  }
}

function openSettings() {
  settingsOverlay.classList.remove('hidden');
}

function closeSettings() {
  settingsOverlay.classList.add('hidden');
}

loadSettings();

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

saveSettingsBtn.addEventListener('click', () => {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ endpoint: endpointEl.value.trim(), token: tokenEl.value.trim() })
  );
  closeSettings();
});

// ---------------------------------------------------------------------
// System instructions (per payment format), persisted in localStorage
// ---------------------------------------------------------------------
const INSTRUCTIONS_KEY = 'paymentAnalyzer.systemInstructions';

const DEFAULT_INSTRUCTIONS = [
  {
    name: 'PACS.008',
    instruction:
      'You are an ISO 20022 payments expert and systems engineer. Analyze XML messages for correctness, schema compliance, and business rule violations. Clearly identify the fatal errors and validation issues, and explain why they would fail processing. Return concise and structured explanations.'
  }
];

function loadInstructions() {
  try {
    const raw = localStorage.getItem(INSTRUCTIONS_KEY);
    const parsed = raw && JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* fall back to defaults */
  }
  return JSON.parse(JSON.stringify(DEFAULT_INSTRUCTIONS));
}

function saveInstructions() {
  localStorage.setItem(INSTRUCTIONS_KEY, JSON.stringify(instructions));
}

let instructions = loadInstructions();

function populateInstructionSelect(selectedName) {
  sysInstructionSelectEl.innerHTML = '';
  instructions.forEach((entry) => {
    const opt = document.createElement('option');
    opt.value = entry.name;
    opt.textContent = entry.name;
    sysInstructionSelectEl.appendChild(opt);
  });
  if (selectedName && instructions.some((e) => e.name === selectedName)) {
    sysInstructionSelectEl.value = selectedName;
  }
  updateInstructionText();
}

function updateInstructionText() {
  const entry = instructions.find((e) => e.name === sysInstructionSelectEl.value);
  sysInstructionTextEl.value = entry ? entry.instruction : '';
}

sysInstructionSelectEl.addEventListener('change', updateInstructionText);

function showInstructionPanel() {
  sysInstructionPanelEl.classList.remove('hidden');
  showInstructionBtn.textContent = 'Hide';
}

function hideInstructionPanel() {
  sysInstructionPanelEl.classList.add('hidden');
  showInstructionBtn.textContent = 'Show';
}

showInstructionBtn.addEventListener('click', () => {
  if (sysInstructionPanelEl.classList.contains('hidden')) {
    showInstructionPanel();
  } else {
    hideInstructionPanel();
  }
});

newInstructionBtn.addEventListener('click', () => {
  const name = prompt('Name for this payment format / system instruction:');
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (instructions.some((e) => e.name === trimmed)) {
    alert('An entry with that name already exists.');
    return;
  }
  instructions.push({ name: trimmed, instruction: '' });
  saveInstructions();
  populateInstructionSelect(trimmed);
  showInstructionPanel();
  sysInstructionTextEl.focus();
});

saveInstructionBtn.addEventListener('click', () => {
  const entry = instructions.find((e) => e.name === sysInstructionSelectEl.value);
  if (!entry) return;
  entry.instruction = sysInstructionTextEl.value;
  saveInstructions();
});

deleteInstructionBtn.addEventListener('click', () => {
  const name = sysInstructionSelectEl.value;
  if (!name) return;
  if (!confirm(`Delete "${name}"?`)) return;
  instructions = instructions.filter((e) => e.name !== name);
  saveInstructions();
  populateInstructionSelect();
});

populateInstructionSelect(instructions[0]?.name);

// ---------------------------------------------------------------------
// Temperature slider
// ---------------------------------------------------------------------
temperatureEl.addEventListener('input', () => {
  temperatureValueEl.textContent = parseFloat(temperatureEl.value).toFixed(2);
});

// ---------------------------------------------------------------------
// Build the request body from prompt + temperature + system instruction
// ---------------------------------------------------------------------
function buildRequestBody() {
  const entry = instructions.find((e) => e.name === sysInstructionSelectEl.value);
  const body = {
    prompt: promptEl.value,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: entry ? entry.instruction : ''
  };
  return JSON.stringify(body);
}

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
    formattedEl.innerHTML = '<p>Please enter an endpoint URL.</p>';
    return;
  }

  if (!promptEl.value.trim()) {
    formattedEl.innerHTML = '<p>Please enter a prompt.</p>';
    return;
  }

  sendBtn.disabled = true;
  formattedEl.innerHTML = '<p>Sending&hellip;</p>';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildRequestBody()
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (res.ok && data && typeof data.response === 'string') {
      formattedEl.innerHTML = renderMarkdown(data.response);
    } else {
      formattedEl.innerHTML =
        `<p><strong>Status: ${res.status} ${res.statusText}</strong></p><pre>${escapeHtml(text)}</pre>`;
    }
  } catch (e) {
    formattedEl.innerHTML =
      `<p>Error: ${escapeHtml(e.message)}</p>` +
      '<p>If this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).</p>';
  } finally {
    sendBtn.disabled = false;
  }
});

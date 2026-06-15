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
const chatSection = document.getElementById('chatSection');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatPanel = document.getElementById('chatPanel');
const chatMessagesEl = document.getElementById('chatMessages');
const chatInputEl = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatLimitNoteEl = document.getElementById('chatLimitNote');
const paymentFormatSelectEl = document.getElementById('paymentFormatSelect');
const newFormatBtn = document.getElementById('newFormatBtn');
const deleteFormatBtn = document.getElementById('deleteFormatBtn');
const repairBtn = document.getElementById('repairBtn');
const repairSection = document.getElementById('repairSection');
const repairDiffEl = document.getElementById('repairDiff');
const copyRepairBtn = document.getElementById('copyRepairBtn');

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
// Payment formats (for the Repair Payment button), persisted in localStorage
// ---------------------------------------------------------------------
const PAYMENT_FORMATS_KEY = 'paymentAnalyzer.paymentFormats';
const DEFAULT_PAYMENT_FORMATS = ['PACS.008'];

function loadPaymentFormats() {
  try {
    const raw = localStorage.getItem(PAYMENT_FORMATS_KEY);
    const parsed = raw && JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* fall back to defaults */
  }
  return [...DEFAULT_PAYMENT_FORMATS];
}

function savePaymentFormats() {
  localStorage.setItem(PAYMENT_FORMATS_KEY, JSON.stringify(paymentFormats));
}

let paymentFormats = loadPaymentFormats();

function populatePaymentFormatSelect(selectedName) {
  paymentFormatSelectEl.innerHTML = '';
  paymentFormats.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    paymentFormatSelectEl.appendChild(opt);
  });
  if (selectedName && paymentFormats.includes(selectedName)) {
    paymentFormatSelectEl.value = selectedName;
  }
}

newFormatBtn.addEventListener('click', () => {
  const name = prompt('Payment format (e.g., PACS.008, PACS.004, CAMT.053):');
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (paymentFormats.includes(trimmed)) {
    alert('That payment format is already in the list.');
    return;
  }
  paymentFormats.push(trimmed);
  savePaymentFormats();
  populatePaymentFormatSelect(trimmed);
});

deleteFormatBtn.addEventListener('click', () => {
  const name = paymentFormatSelectEl.value;
  if (!name) return;
  if (!confirm(`Remove "${name}" from the payment formats list?`)) return;
  paymentFormats = paymentFormats.filter((n) => n !== name);
  savePaymentFormats();
  populatePaymentFormatSelect();
});

populatePaymentFormatSelect(paymentFormats[0]);

// ---------------------------------------------------------------------
// Temperature slider
// ---------------------------------------------------------------------
temperatureEl.addEventListener('input', () => {
  temperatureValueEl.textContent = parseFloat(temperatureEl.value).toFixed(2);
});

// ---------------------------------------------------------------------
// Build the request body from prompt + temperature + system instruction
// ---------------------------------------------------------------------
function getSelectedInstruction() {
  const entry = instructions.find((e) => e.name === sysInstructionSelectEl.value);
  return entry ? entry.instruction : '';
}

function buildRequestBody() {
  const body = {
    prompt: promptEl.value,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: getSelectedInstruction()
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

  const segments = [];
  const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', content: match[1].replace(/\n$/, '') });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments
    .map((segment) => {
      if (segment.type === 'code') {
        return `<pre><code>${escapeHtml(segment.content)}</code></pre>`;
      }
      return segment.content
        .split(/\n\s*\n/)
        .filter((block) => block.trim())
        .map(renderBlock)
        .join('\n');
    })
    .join('\n');
}

// ---------------------------------------------------------------------
// Line-based diff (GitHub-style) for the Repair Payment result
// ---------------------------------------------------------------------
function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const n = oldLines.length;
  const m = newLines.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldLines[i] === newLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      ops.push({ type: 'equal', line: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'removed', line: oldLines[i] });
      i++;
    } else {
      ops.push({ type: 'added', line: newLines[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: 'removed', line: oldLines[i] });
    i++;
  }
  while (j < m) {
    ops.push({ type: 'added', line: newLines[j] });
    j++;
  }

  return ops;
}

function renderDiff(oldText, newText) {
  const ops = diffLines(oldText, newText);

  if (ops.every((op) => op.type === 'equal')) {
    return '<p class="diff-note">No changes were needed - the payment already looked correct.</p>';
  }

  return ops
    .map((op) => {
      const marker = op.type === 'added' ? '+' : op.type === 'removed' ? '-' : ' ';
      return `<div class="diff-line diff-${op.type}"><span class="diff-marker">${marker}</span><span class="diff-text">${escapeHtml(op.line) || ' '}</span></div>`;
    })
    .join('');
}

// ---------------------------------------------------------------------
// "Chat about this" - follow-up conversation about the analyzed payment
// ---------------------------------------------------------------------
const CHAT_MESSAGE_LIMIT = 50;

let chatContext = null;
let chatHistory = [];

function resetChat() {
  chatContext = null;
  chatHistory = [];
  chatMessagesEl.innerHTML = '';
  chatInputEl.value = '';
  chatInputEl.disabled = false;
  chatSendBtn.disabled = false;
  chatLimitNoteEl.classList.add('hidden');
  chatPanel.classList.add('hidden');
  chatSection.classList.add('hidden');
  chatToggleBtn.textContent = 'Chat about this';
}

function startChat(context) {
  chatContext = context;
  chatHistory = [];
  chatMessagesEl.innerHTML = '';
  chatInputEl.value = '';
  chatInputEl.disabled = false;
  chatSendBtn.disabled = false;
  chatLimitNoteEl.classList.add('hidden');
  chatPanel.classList.add('hidden');
  chatToggleBtn.textContent = 'Chat about this';
  chatSection.classList.remove('hidden');
}

function appendChatMessage(role, html) {
  const el = document.createElement('div');
  el.className = `chat-message ${role}`;
  el.innerHTML = html;
  chatMessagesEl.appendChild(el);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return el;
}

function buildChatRequestBody(message) {
  const transcriptParts = [
    'Original payment message being discussed:',
    chatContext.prompt,
    '',
    'Your initial analysis of that message:',
    chatContext.initialResponse
  ];

  chatHistory.forEach((m) => {
    transcriptParts.push('');
    transcriptParts.push(`${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`);
  });

  transcriptParts.push('');
  transcriptParts.push(`User: ${message}`);
  transcriptParts.push('');
  transcriptParts.push('Assistant:');

  const baseInstruction = chatContext.systemInstruction ? `${chatContext.systemInstruction}\n\n` : '';
  const followUpInstruction =
    baseInstruction +
    'You already analyzed the payment message above and provided the initial analysis shown. ' +
    'You are now in a follow-up conversation with the user about that same payment message and your analysis. ' +
    'Answer their questions, clarify or expand on your analysis, and help them correct the payment if asked. ' +
    'Respond conversationally to only the latest User message, using the prior context as needed. ' +
    'Do not repeat the full original analysis unless asked.';

  return JSON.stringify({
    prompt: transcriptParts.join('\n'),
    temperature: chatContext.temperature,
    system_instruction: followUpInstruction
  });
}

async function sendChatMessage() {
  const message = chatInputEl.value.trim();
  if (!message || !chatContext || chatHistory.length >= CHAT_MESSAGE_LIMIT) return;

  chatInputEl.value = '';
  chatInputEl.disabled = true;
  chatSendBtn.disabled = true;

  appendChatMessage('user', escapeHtml(message).replace(/\n/g, '<br>'));
  const pendingEl = appendChatMessage('assistant pending', '<em>Thinking&hellip;</em>');

  try {
    const res = await fetch(endpointEl.value.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildChatRequestBody(message)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    pendingEl.classList.remove('pending');

    if (res.ok && data && typeof data.response === 'string') {
      pendingEl.innerHTML = renderMarkdown(data.response);
      chatHistory.push({ role: 'user', content: message });
      chatHistory.push({ role: 'assistant', content: data.response });
    } else {
      pendingEl.innerHTML =
        `<p><strong>Status: ${res.status} ${res.statusText}</strong></p><pre>${escapeHtml(text)}</pre>`;
    }
  } catch (e) {
    pendingEl.classList.remove('pending');
    pendingEl.innerHTML =
      `<p>Error: ${escapeHtml(e.message)}</p>` +
      '<p>If this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).</p>';
  } finally {
    if (chatHistory.length >= CHAT_MESSAGE_LIMIT) {
      chatInputEl.disabled = true;
      chatSendBtn.disabled = true;
      chatLimitNoteEl.classList.remove('hidden');
    } else {
      chatInputEl.disabled = false;
      chatSendBtn.disabled = false;
      chatInputEl.focus();
    }
  }
}

chatToggleBtn.addEventListener('click', () => {
  if (chatPanel.classList.contains('hidden')) {
    chatPanel.classList.remove('hidden');
    chatToggleBtn.textContent = 'Hide chat';
    chatInputEl.focus();
  } else {
    chatPanel.classList.add('hidden');
    chatToggleBtn.textContent = 'Chat about this';
  }
});

chatSendBtn.addEventListener('click', sendChatMessage);

chatInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// ---------------------------------------------------------------------
// Repair Payment - ask the AI to return only the corrected message
// ---------------------------------------------------------------------
let lastRepairedPayment = '';

function buildRepairRequestBody(format) {
  const instruction =
    `You are an automated ${format} payment repair engine. ` +
    `You will be given a ${format} payment message that may contain errors, invalid values, or schema/business rule violations. ` +
    `Correct the message so that it is fully valid and compliant with the ${format} format, making the minimal changes ` +
    'necessary to fix the issues while preserving the original structure and values wherever possible. ' +
    'Respond with ONLY the corrected payment message itself, and nothing else - no explanation, no commentary, ' +
    'no markdown formatting, and no code fences.';

  return JSON.stringify({
    prompt: promptEl.value,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: instruction
  });
}

function stripCodeFence(text) {
  const trimmed = text.trim();
  const match = trimmed.match(/```[^\n]*\n([\s\S]*?)```/);
  return match ? match[1].replace(/\n$/, '') : trimmed;
}

repairBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  const format = paymentFormatSelectEl.value;

  repairSection.classList.remove('hidden');
  copyRepairBtn.classList.add('hidden');

  if (!endpoint) {
    repairDiffEl.innerHTML = '<p>Please enter an endpoint URL.</p>';
    return;
  }

  if (!promptEl.value.trim()) {
    repairDiffEl.innerHTML = '<p>Please enter a prompt.</p>';
    return;
  }

  if (!format) {
    repairDiffEl.innerHTML = '<p>Please add a payment format.</p>';
    return;
  }

  repairBtn.disabled = true;
  repairDiffEl.innerHTML = '<p>Repairing&hellip;</p>';

  const original = promptEl.value;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildRepairRequestBody(format)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (res.ok && data && typeof data.response === 'string') {
      const repaired = stripCodeFence(data.response);
      repairDiffEl.innerHTML = renderDiff(original, repaired);
      lastRepairedPayment = repaired;
      copyRepairBtn.classList.remove('hidden');
      copyRepairBtn.textContent = 'Copy';
    } else {
      repairDiffEl.innerHTML =
        `<p><strong>Status: ${res.status} ${res.statusText}</strong></p><pre>${escapeHtml(text)}</pre>`;
    }
  } catch (e) {
    repairDiffEl.innerHTML =
      `<p>Error: ${escapeHtml(e.message)}</p>` +
      '<p>If this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).</p>';
  } finally {
    repairBtn.disabled = false;
  }
});

copyRepairBtn.addEventListener('click', () => {
  if (!lastRepairedPayment) return;
  navigator.clipboard.writeText(lastRepairedPayment).then(
    () => {
      copyRepairBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyRepairBtn.textContent = 'Copy';
      }, 1500);
    },
    () => {
      copyRepairBtn.textContent = 'Copy failed';
      setTimeout(() => {
        copyRepairBtn.textContent = 'Copy';
      }, 1500);
    }
  );
});

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
  resetChat();

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
      startChat({
        prompt: promptEl.value,
        initialResponse: data.response,
        systemInstruction: getSelectedInstruction(),
        temperature: parseFloat(temperatureEl.value)
      });
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

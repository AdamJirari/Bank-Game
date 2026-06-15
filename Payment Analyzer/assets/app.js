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
const explainBtn = document.getElementById('explainBtn');
const explainSection = document.getElementById('explainSection');
const repairExplanationEl = document.getElementById('repairExplanation');
const fourEyeCheckBtn = document.getElementById('fourEyeCheckBtn');
const fourEyeSection = document.getElementById('fourEyeSection');
const fourEyeConfidenceEl = document.getElementById('fourEyeConfidence');
const fourEyeReportEl = document.getElementById('fourEyeReport');
const chatModeBtn = document.getElementById('chatModeBtn');
const repairModeBtn = document.getElementById('repairModeBtn');
const chatModeTab = document.getElementById('chatModeTab');
const repairModeTab = document.getElementById('repairModeTab');
const temperatureRepairEl = document.getElementById('temperatureRepair');
const temperatureRepairValueEl = document.getElementById('temperatureRepairValue');
const repairTemplateTextEl = document.getElementById('repairTemplateText');
const repairTemplatePanelEl = document.getElementById('repairTemplatePanel');
const showRepairTemplateBtn = document.getElementById('showRepairTemplateBtn');
const saveRepairTemplateBtn = document.getElementById('saveRepairTemplateBtn');
const resetRepairTemplateBtn = document.getElementById('resetRepairTemplateBtn');

// ---------------------------------------------------------------------
// Chat Mode / Repair Mode tabs
// ---------------------------------------------------------------------
function setActiveTab(tab) {
  const isChat = tab === 'chat';
  chatModeBtn.classList.toggle('active', isChat);
  repairModeBtn.classList.toggle('active', !isChat);
  chatModeTab.classList.toggle('hidden', !isChat);
  repairModeTab.classList.toggle('hidden', isChat);
}

chatModeBtn.addEventListener('click', () => setActiveTab('chat'));
repairModeBtn.addEventListener('click', () => setActiveTab('repair'));

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
// Repair prompt template - shared across all payment formats,
// persisted in localStorage
// ---------------------------------------------------------------------
const REPAIR_TEMPLATE_KEY = 'paymentAnalyzer.repairTemplate';
const DEFAULT_REPAIR_TEMPLATE =
  'You are an automated {format} payment repair engine. ' +
  'You will be given a {format} payment message that may contain errors, invalid values, or schema/business rule violations. ' +
  'Correct the message so that it is fully valid and compliant with the {format} format, making the minimal changes ' +
  'necessary to fix the issues while preserving the original structure and values wherever possible. ' +
  'Respond with ONLY the corrected payment message itself, and nothing else - no explanation, no commentary, ' +
  'no markdown formatting, and no code fences.';

function loadRepairTemplate() {
  const saved = localStorage.getItem(REPAIR_TEMPLATE_KEY);
  return saved !== null ? saved : DEFAULT_REPAIR_TEMPLATE;
}

let repairTemplate = loadRepairTemplate();
repairTemplateTextEl.value = repairTemplate;

function showRepairTemplatePanel() {
  repairTemplatePanelEl.classList.remove('hidden');
  showRepairTemplateBtn.textContent = 'Hide';
}

function hideRepairTemplatePanel() {
  repairTemplatePanelEl.classList.add('hidden');
  showRepairTemplateBtn.textContent = 'Show';
}

showRepairTemplateBtn.addEventListener('click', () => {
  if (repairTemplatePanelEl.classList.contains('hidden')) {
    showRepairTemplatePanel();
  } else {
    hideRepairTemplatePanel();
  }
});

saveRepairTemplateBtn.addEventListener('click', () => {
  repairTemplate = repairTemplateTextEl.value;
  localStorage.setItem(REPAIR_TEMPLATE_KEY, repairTemplate);
  saveRepairTemplateBtn.textContent = 'Saved!';
  setTimeout(() => {
    saveRepairTemplateBtn.textContent = 'Save';
  }, 1500);
});

resetRepairTemplateBtn.addEventListener('click', () => {
  if (!confirm('Reset the repair prompt template to its default? This will discard your edits.')) return;
  repairTemplate = DEFAULT_REPAIR_TEMPLATE;
  repairTemplateTextEl.value = repairTemplate;
  localStorage.removeItem(REPAIR_TEMPLATE_KEY);
});

// ---------------------------------------------------------------------
// Temperature slider (synced between Chat Mode and Repair Mode)
// ---------------------------------------------------------------------
function setTemperature(value) {
  const formatted = parseFloat(value).toFixed(2);
  temperatureEl.value = value;
  temperatureRepairEl.value = value;
  temperatureValueEl.textContent = formatted;
  temperatureRepairValueEl.textContent = formatted;
}

temperatureEl.addEventListener('input', () => setTemperature(temperatureEl.value));
temperatureRepairEl.addEventListener('input', () => setTemperature(temperatureRepairEl.value));

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
// Best-effort XML pretty-printer, used to normalize payment messages
// before repairing/diffing so formatting alone doesn't show as a change
// ---------------------------------------------------------------------
function formatPaymentMessage(text) {
  const trimmed = (text || '').trim();
  if (!trimmed.startsWith('<')) return trimmed;

  const normalized = trimmed.replace(/>\s+</g, '><').replace(/></g, '>\n<');
  const indentUnit = '  ';
  let depth = 0;
  const lines = [];

  normalized.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    if (/^<\/[^>]+>$/.test(line)) {
      depth = Math.max(0, depth - 1);
      lines.push(indentUnit.repeat(depth) + line);
      return;
    }

    lines.push(indentUnit.repeat(depth) + line);

    const isSelfClosing = /^<[^>]+\/>$/.test(line);
    const isDeclaration = /^<[!?]/.test(line);
    const isOpenAndClose = /^<([\w:.-]+)(?:\s[^>]*)?>.*<\/\1>$/.test(line);
    if (!isSelfClosing && !isDeclaration && !isOpenAndClose) {
      depth++;
    }
  });

  return lines.join('\n');
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
let lastFormattedOriginal = '';

const NORMALIZE_INSTRUCTION =
  'You are an XML formatting normalizer for payment messages. ' +
  'You will be given an XML payment message whose formatting may be messy - elements may run together on ' +
  'the same line, indentation may be missing or inconsistent, and line breaks may be missing or misplaced. ' +
  'Reformat the message so that each XML element starts on its own line with clean, consistent nested ' +
  'indentation, WITHOUT changing, adding, removing, or correcting any element names, attributes, namespaces, ' +
  'or values. This is a formatting-only pass - do not fix errors, validate, or alter the content in any way. ' +
  'Respond with ONLY the reformatted message itself, and nothing else - no explanation, no commentary, ' +
  'no markdown formatting, and no code fences.';

function buildNormalizeRequestBody(message) {
  return JSON.stringify({
    prompt: message,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: NORMALIZE_INSTRUCTION
  });
}

function buildRepairRequestBody(format, message) {
  const instruction = repairTemplate.split('{format}').join(format);

  return JSON.stringify({
    prompt: message,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: instruction
  });
}

function buildExplainRequestBody(format, original, repaired) {
  const instruction =
    `You are an automated ${format} payment repair engine. ` +
    `You previously repaired the ${format} payment message below, going from the "Original" version to the "Repaired" version. ` +
    'Explain what changes were made and why they were necessary to make the message valid and compliant, ' +
    'in clear, structured terms for a payments operations analyst. Reference specific fields where relevant.';

  const message =
    `Original ${format} message:\n${original}\n\nRepaired ${format} message:\n${repaired}\n\n` +
    'Explain the changes made between the original and repaired messages above.';

  return JSON.stringify({
    prompt: message,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: instruction
  });
}

function buildFourEyeRequestBody(format, original, repaired) {
  const instruction =
    `You are a second, independent reviewer performing a "four eyes" check on a ${format} payment repair, ` +
    'as part of a dual-control review process. A first pass already corrected the payment message below, going ' +
    'from the "Original" version to the "Repaired" version. ' +
    'Independently verify the repaired message: confirm every change made was correct and necessary, and check the ' +
    'repaired message end-to-end for any remaining errors, invalid values, or schema/business rule violations - ' +
    'including issues the first pass may have missed or introduced. ' +
    'If you find remaining issues, clearly list each additional change that is still needed (field, current value, ' +
    'corrected value, and reason). If the repair is fully correct and complete, state that explicitly. ' +
    'Respond in exactly this format: the first line must be "Confidence: <N>" where <N> is a whole number from 0 to ' +
    '100 representing your confidence that the repaired message is fully correct and compliant, followed by a blank ' +
    'line, then your findings in markdown.';

  const message =
    `Original ${format} message (before repair):\n${original}\n\n` +
    `Repaired ${format} message (after repair):\n${repaired}\n\n` +
    'Perform the four eyes check described above on the repaired message.';

  return JSON.stringify({
    prompt: message,
    temperature: parseFloat(temperatureEl.value),
    system_instruction: instruction
  });
}

function parseFourEyeResponse(text) {
  const trimmed = stripCodeFence(text);
  const match = trimmed.match(/^\s*Confidence:\s*(\d{1,3})\s*%?\s*\n+([\s\S]*)$/i);
  if (match) {
    const confidence = Math.max(0, Math.min(100, parseInt(match[1], 10)));
    return { confidence, report: match[2].trim() };
  }
  return { confidence: null, report: trimmed };
}

function renderConfidence(confidence) {
  if (confidence === null) {
    fourEyeConfidenceEl.classList.add('hidden');
    fourEyeConfidenceEl.innerHTML = '';
    return;
  }
  let level = 'high';
  if (confidence < 50) level = 'low';
  else if (confidence < 80) level = 'medium';
  fourEyeConfidenceEl.className = `confidence-badge confidence-${level}`;
  fourEyeConfidenceEl.innerHTML =
    `<span class="confidence-label">Confidence</span><span class="confidence-value">${confidence}%</span>`;
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
  explainBtn.classList.add('hidden');
  explainSection.classList.add('hidden');
  fourEyeCheckBtn.classList.add('hidden');
  fourEyeSection.classList.add('hidden');
  fourEyeConfidenceEl.classList.add('hidden');
  fourEyeConfidenceEl.innerHTML = '';

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
  repairDiffEl.innerHTML = '<p>Normalizing&hellip;</p>';

  try {
    const normalizeRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildNormalizeRequestBody(promptEl.value)
    });

    const normalizeText = await normalizeRes.text();

    let normalizeData;
    try {
      normalizeData = JSON.parse(normalizeText);
    } catch {
      normalizeData = null;
    }

    if (!normalizeRes.ok || !normalizeData || typeof normalizeData.response !== 'string') {
      repairDiffEl.innerHTML =
        `<p><strong>Status: ${normalizeRes.status} ${normalizeRes.statusText}</strong></p><pre>${escapeHtml(normalizeText)}</pre>`;
      return;
    }

    const formattedOriginal = formatPaymentMessage(stripCodeFence(normalizeData.response));

    repairDiffEl.innerHTML = '<p>Repairing&hellip;</p>';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildRepairRequestBody(format, formattedOriginal)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (res.ok && data && typeof data.response === 'string') {
      const repaired = formatPaymentMessage(stripCodeFence(data.response));
      repairDiffEl.innerHTML = renderDiff(formattedOriginal, repaired);
      lastFormattedOriginal = formattedOriginal;
      lastRepairedPayment = repaired;
      copyRepairBtn.classList.remove('hidden');
      copyRepairBtn.textContent = 'Copy';
      explainBtn.classList.remove('hidden');
      fourEyeCheckBtn.classList.remove('hidden');
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

explainBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  if (!endpoint || !lastFormattedOriginal || !lastRepairedPayment) return;

  const format = paymentFormatSelectEl.value;

  explainSection.classList.remove('hidden');
  explainBtn.disabled = true;
  repairExplanationEl.innerHTML = '<p>Explaining&hellip;</p>';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildExplainRequestBody(format, lastFormattedOriginal, lastRepairedPayment)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (res.ok && data && typeof data.response === 'string') {
      repairExplanationEl.innerHTML = renderMarkdown(data.response);
    } else {
      repairExplanationEl.innerHTML =
        `<p><strong>Status: ${res.status} ${res.statusText}</strong></p><pre>${escapeHtml(text)}</pre>`;
    }
  } catch (e) {
    repairExplanationEl.innerHTML =
      `<p>Error: ${escapeHtml(e.message)}</p>` +
      '<p>If this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).</p>';
  } finally {
    explainBtn.disabled = false;
  }
});

fourEyeCheckBtn.addEventListener('click', async () => {
  const endpoint = endpointEl.value.trim();
  if (!endpoint || !lastFormattedOriginal || !lastRepairedPayment) return;

  const format = paymentFormatSelectEl.value;

  fourEyeSection.classList.remove('hidden');
  fourEyeCheckBtn.disabled = true;
  fourEyeConfidenceEl.classList.add('hidden');
  fourEyeConfidenceEl.innerHTML = '';
  fourEyeReportEl.innerHTML = '<p>Running four eye check&hellip;</p>';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenEl.value.trim()}`
      },
      body: buildFourEyeRequestBody(format, lastFormattedOriginal, lastRepairedPayment)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (res.ok && data && typeof data.response === 'string') {
      const { confidence, report } = parseFourEyeResponse(data.response);
      renderConfidence(confidence);
      fourEyeReportEl.innerHTML = renderMarkdown(report);
    } else {
      fourEyeReportEl.innerHTML =
        `<p><strong>Status: ${res.status} ${res.statusText}</strong></p><pre>${escapeHtml(text)}</pre>`;
    }
  } catch (e) {
    fourEyeReportEl.innerHTML =
      `<p>Error: ${escapeHtml(e.message)}</p>` +
      '<p>If this says "Failed to fetch", the endpoint is likely blocking the request via CORS ' +
      '(it needs to return Access-Control-Allow-Origin for browser requests).</p>';
  } finally {
    fourEyeCheckBtn.disabled = false;
  }
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

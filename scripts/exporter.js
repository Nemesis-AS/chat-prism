const SITE_CONFIGS = {
  "chatgpt.com": {
    messageSelector: '[data-message-author-role]',
    getRole: el => el.getAttribute('data-message-author-role') === 'user' ? 'User' : 'AI',
    getContent: el => (el.querySelector('.whitespace-pre-wrap, .prose') ?? el).innerText.trim(),
  },
  "claude.ai": {
    messageSelector: '[data-testid="user-message"], [data-is-streaming]',
    getRole: el => el.hasAttribute('data-is-streaming') ? 'AI' : 'User',
    getContent: el => el.hasAttribute('data-is-streaming')
      ? el.querySelector('.font-claude-response')?.innerText.trim()
      : el.innerText.trim(),
  },
  "gemini.google.com": {
    messageSelector: 'user-query, model-response',
    getRole: el => el.tagName.toLowerCase() === 'user-query' ? 'User' : 'AI',
    getContent: el => el.innerText.trim(),
  },
};

function getSiteConfig() {
  return Object.entries(SITE_CONFIGS).find(([host]) => location.hostname.includes(host))?.[1] ?? null;
}

function buildExportText(config) {
  const messages = [...document.querySelectorAll(config.messageSelector)];
  if (!messages.length) return null;

  const chunks = [];
  for (let i = 0; i < messages.length; i++) {
    const role = config.getRole(messages[i]);
    const content = config.getContent(messages[i]);
    if (!content) continue;

    if (role === 'User' && chunks.length > 0) chunks.push('---');
    chunks.push(`${role}: ${content}`);
  }

  return chunks.join('\n\n');
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== 'exportChat') return;

  const config = getSiteConfig();
  if (!config) {
    sendResponse({ error: 'unsupported' });
    return;
  }

  const text = buildExportText(config);
  if (!text) {
    sendResponse({ error: 'empty' });
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  downloadText(text, `chat-${date}.txt`);
  sendResponse({ ok: true });
});

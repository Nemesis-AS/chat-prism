const STORAGE_KEY = "colorSwatchesEnabled";
const colorRegex = /#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?/;

let enabled = true;

function setEnabled(val) {
  enabled = val;
  document.documentElement.classList.toggle("gpt-tools-swatches-off", !val);
}

chrome.storage.local.get(STORAGE_KEY, (result) => {
  setEnabled(result[STORAGE_KEY] !== false);
});

chrome.storage.onChanged.addListener((changes) => {
  if (STORAGE_KEY in changes) setEnabled(changes[STORAGE_KEY].newValue);
});

async function copyText(text) {
  await window.navigator.clipboard.writeText(text).catch(console.error);
}

function showCopiedTooltip(anchor) {
  const existing = anchor.querySelector(".hex-tooltip");
  if (existing) existing.remove();

  const tip = document.createElement("span");
  tip.className = "hex-tooltip";
  tip.textContent = "Copied!";
  anchor.appendChild(tip);

  tip.addEventListener("animationend", () => tip.remove());
}

function colorizeHex(elements) {
  elements.forEach((el) => {
    if (el.classList.contains("hex-color")) return;

    const match = el.textContent.match(colorRegex);
    if (match) {
      el.classList.add("hex-color");
      el.style.setProperty("--hex-color", match[0]);

      el.addEventListener("click", () => {
        copyText(match[0]);
        showCopiedTooltip(el);
      });
    }
  });
}

const rootObserver = new MutationObserver((records) => {
  if (!enabled) return;
  const thread = document.getElementById("thread");
  if (!thread) return;

  const newCodes = [];
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches("code")) newCodes.push(node);
      newCodes.push(...node.querySelectorAll("code"));
    }
  }
  colorizeHex(newCodes);
});

rootObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

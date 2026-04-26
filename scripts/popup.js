const STORAGE_KEY = "colorSwatchesEnabled";
const toggle = document.getElementById("toggle-color-swatches");
const btnExport = document.getElementById("btn-export");

chrome.storage.local.get(STORAGE_KEY, (result) => {
  toggle.checked = result[STORAGE_KEY] !== false;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked });
});

const EXPORT_ERRORS = {
  unsupported: "Not supported on this page",
  empty: "No messages found",
};

btnExport.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "exportChat" }, (response) => {
    const errorMsg = chrome.runtime.lastError?.message || EXPORT_ERRORS[response?.error];
    if (errorMsg) {
      showExportError(errorMsg);
    }
  });
});

function showExportError(msg) {
  const original = btnExport.innerHTML;
  btnExport.classList.add("error");
  btnExport.textContent = msg;
  setTimeout(() => {
    btnExport.classList.remove("error");
    btnExport.innerHTML = original;
  }, 2500);
}

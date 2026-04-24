const STORAGE_KEY = "colorSwatchesEnabled";
const toggle = document.getElementById("toggle-color-swatches");

chrome.storage.local.get(STORAGE_KEY, (result) => {
  toggle.checked = result[STORAGE_KEY] !== false;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked });
});

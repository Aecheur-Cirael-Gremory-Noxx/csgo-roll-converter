const checkbox = document.getElementById("toggle-switch");
const currencySelect = document.getElementById("currency-select");

// Fonction nommée pour éviter l'erreur "fonction anonyme"
function applySettings(result) {
  checkbox.checked = result.enabled ?? true;
  currencySelect.value = result.currency || "EUR";
}

chrome.storage.sync.get(["enabled", "currency"], applySettings);

// Notifier le content.js quand l'utilisateur change une option
function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "settingsChanged" });
  });
}

// Sauvegarde du switch
checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: checkbox.checked }, notifyContentScript);
});

// Sauvegarde de la devise
currencySelect.addEventListener("change", () => {
  chrome.storage.sync.set({ currency: currencySelect.value }, notifyContentScript);
});

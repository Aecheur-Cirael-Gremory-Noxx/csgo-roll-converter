// Les taux par devise
const tauxConversion = {
  EUR: { taux: 0.633, symbole: "€" },
  USD: { taux: 0.703, symbole: "$" },
  PLN: { taux: 2.704, symbole: "zł" },
  RUB: { taux: 59.75, symbole: "₽" }
};

function convertirEtAfficherPrix() {
  chrome.storage.sync.get(["enabled", "currency"], (result) => {
    if (!result.enabled) return;

    const currency = result.currency || "EUR";
    const { taux, symbole } = tauxConversion[currency];

    const elements = document.querySelectorAll("span.currency-value");

    elements.forEach(el => {
      if (el.getAttribute("data-euro-added")) return;

      const coinStr = el.textContent.replace(/,/g, "").trim();
      const coinVal = parseFloat(coinStr);

      if (!isNaN(coinVal) && coinVal > 0.01) {
        const converted = (coinVal * taux).toFixed(2);

        const conversionSpan = document.createElement("span");
        conversionSpan.style.marginLeft = "4px";
        conversionSpan.style.color = "#4CAF50";
        conversionSpan.style.fontSize = (el.style.fontSize ? `calc(${el.style.fontSize} - 1px)` : "0.85em");
        conversionSpan.style.fontStyle = "italic";
        conversionSpan.textContent = ` (${symbole}${converted})`;

        el.parentNode.insertBefore(conversionSpan, el.nextSibling);
        el.setAttribute("data-euro-added", "true");
      }
    });
  });
}

window.addEventListener("load", () => {
  convertirEtAfficherPrix();

  const observer = new MutationObserver(() => {
    convertirEtAfficherPrix();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "settingsChanged") {
    chrome.storage.sync.get(["enabled"], (result) => {
      const enabled = result.enabled ?? true;

      // Supprimer toutes les anciennes conversions
      document.querySelectorAll("span[data-euro-added='true']").forEach(el => {
        const next = el.nextSibling;
        if (next && next.nodeType === Node.ELEMENT_NODE && next.textContent.includes("(")) {
          next.remove(); // Supprime le span qui contient la conversion
        }
        el.removeAttribute("data-euro-added");
      });

      // Si c'est activé, on relance la conversion
      if (enabled) {
        convertirEtAfficherPrix();
      }
    });
  }
});



chrome.runtime.onInstalled.addListener((_reason) => {
  chrome.tabs.create({
    url: "/src/instruction.html",
  });
});

// Define a function to set the popup for the currently active tab
async function setPopupForActiveTab() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (currentTab) {
    // Set the popup for the active tab
    const popup = currentTab.url.includes("https://www.youtube.com/watch")
      ? "/src/popup.html"
      : "/src/instruction.html";
    chrome.action.setPopup({ tabId: currentTab.id, popup });
  }
}

// Listen for tab switches
chrome.tabs.onActivated.addListener(function (activeInfo) {
  setPopupForActiveTab();
});

/** Newly created tab won't have popup set so this listener does that */
chrome.tabs.onUpdated.addListener(function (activeInfo) {
  setPopupForActiveTab();
});

// Set initial popup for the currently active tab when the extension is loaded
setPopupForActiveTab();

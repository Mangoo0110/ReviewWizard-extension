console.log("Popup script loaded.");

// Create a long-lived connection to the background script
const port = chrome.runtime.connect({ name: "popup" });

port.onDisconnect.addListener(() => {
  console.log("Popup disconnected.");
});

// UI elements for displaying counts
const positiveCountEl = document.getElementById('positive-count');
const negativeCountEl = document.getElementById('negative-count');
const requirementCountEl = document.getElementById('requirement-count');
const neutralCountEl = document.getElementById('neutral-count');
const loadingIndicatorEl = document.getElementById('loading-indicator');

// On popup load, request the current counts for the active tab
await chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
  const tabId = tabs[0].id;

  // Retrieve stored counts
  chrome.storage.local.get([`classificationCounts_${tabId}`, `loading_${tabId}`], (result) => {
    const counts = result[`classificationCounts_${tabId}`];
    const isLoading = result[`loading_${tabId}`];

    if (isLoading) {
      loadingIndicatorEl.textContent = "Classifying...";
    } else if (counts) {
      // Display the stored counts
      positiveCountEl.textContent = counts.positive || 0;
      negativeCountEl.textContent = counts.negative || 0;
      requirementCountEl.textContent = counts.requirement || 0;
      neutralCountEl.textContent = counts.neutral || 0;

      loadingIndicatorEl.textContent = "Classification complete!";
    } else {
      loadingIndicatorEl.textContent = "No reviews classified yet.";
    }
  });

  // Request the latest counts from background.js
  port.postMessage({ type: "REQUEST_REVIEW_COUNTS", tabId: tabId });

  // Listen for the latest counts response
  port.onMessage.addListener((message) => {
    if (message.type === "RESPONSE_REVIEW_COUNTS") {
      const counts = message.classificationCounts;

      // Update the UI with the latest counts
      positiveCountEl.textContent = counts.positive || 0;
      negativeCountEl.textContent = counts.negative || 0;
      requirementCountEl.textContent = counts.requirement || 0;
      neutralCountEl.textContent = counts.neutral || 0;

      loadingIndicatorEl.textContent = "Classification complete!";
    }
  });
});

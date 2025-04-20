let aiSession;

// Initialize AI session
async function initializeAISession() {
  console.log("Initializing AI session...");
  const prompt = `
    You are a helpful assistant that classifies reviews into positive, negative, requirement, or neutral.
    Classify the review into one of these labels:
    - "positive" → if the review expresses satisfaction or praise.
    - "negative" → if the review expresses dissatisfaction or criticism.
    - "requirement" → if the review mentions a feature request, suggestion, or improvement.
    If none of these labels fit, classify it as "neutral".
  `;
  aiSession = await ai.languageModel.create({
    systemPrompt: prompt
  });
  console.log("AI session initialized.");
}

// Classify reviews with AI
async function classifyWithAI(tabId, reviews) {
  console.log("Starting review classification...");

  // Set loading state for the specific tab
  chrome.storage.local.set({ [`loading_${tabId}`]: true });

  if (!aiSession) {
    await initializeAISession();  // Initialize the session if not already
  }

  let classificationCounts = {
    positive: 0,
    negative: 0,
    requirement: 0,
    neutral: 0
  };

  // Process reviews one by one
  for (let review of reviews) {

    const userMessage = `Review: "${review}"`;

    try {
      const aiResponse = await aiSession?.prompt(userMessage);
      console.log("AI response:", aiResponse);

      // Get classification label from the AI response
      const classification = aiResponse;

      if (classificationCounts.hasOwnProperty(classification)) {
        classificationCounts[classification]++;
        //console.log(`Review classified as: ${classification}`);
      } else {
        classificationCounts.neutral++;
        //console.log(`Review classified as: neutral (default)`);
      }
    } catch (error) {
      console.error("Error classifying review:", error);
    }
  }

  console.log("Classification counts:", classificationCounts);

  // Store the counts persistently in chrome.storage.local
  chrome.storage.local.set({ [`classificationCounts_${tabId}`]: classificationCounts });

  // Stop loading and notify popup
  chrome.storage.local.set({ [`loading_${tabId}`]: false });

  // Send message to the popup if it is open
  chrome.runtime.sendMessage({
    type: "UPDATE_LABEL_COUNTS",
    tabId: tabId,
    classificationCounts: classificationCounts
  });
}

// Send message to the popup
function sendToPopup(tabId, classificationCounts) {
  chrome.runtime.sendMessage({
    type: "UPDATE_LABEL_COUNTS",
    tabId: tabId,
    classificationCounts: classificationCounts
  });
}

// Listen for incoming messages from content.js
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "EXTRACTED_REVIEWS") {
    const tabId = sender.tab.id;  // Get tabId from sender.tab.id
    const reviews = message.reviews;
    classifyWithAI(tabId, reviews);
  }
});

// Listen for connection requests from the popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    console.log("Popup connected!");

    // Listen for messages from the popup
    port.onMessage.addListener((message) => {
      if (message.type === "REQUEST_REVIEW_COUNTS") {
        const tabId = message.tabId;

        // Retrieve the latest counts from storage
        chrome.storage.local.get([`classificationCounts_${tabId}`], (result) => {
          const counts = result[`classificationCounts_${tabId}`] || {
            positive: 0,
            negative: 0,
            requirement: 0,
            neutral: 0
          };
          port.postMessage({
            type: "RESPONSE_REVIEW_COUNTS",
            classificationCounts: counts
          });
        });
      }
    });
  }
});


// ✅ Clear storage when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab closed: ${tabId}. Clearing local storage.`);

  // Remove the classification counts and loading state for the closed tab
  chrome.storage.local.remove([`classificationCounts_${tabId}`, `loading_${tabId}`], () => {
    console.log(`Cleared data for tab: ${tabId}`);
  });
});
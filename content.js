// Extract reviews from the Amazon product page
async function extractReviewsFromPage() {
  console.log("Extracting reviews from the page...");
  const reviewElements = document.querySelectorAll('[data-hook="review-body"]');
  const reviews = [];

  reviewElements.forEach((element, index) => {
    const reviewText = element.innerText.trim();
    if (reviewText) {
      reviews.push(reviewText);
    }
  });

  // Send extracted reviews and tabId to background.js for classification
  chrome.runtime.sendMessage({ 
    type: "EXTRACTED_REVIEWS", 
    reviews: reviews, 
  });

  //return reviews; // For debugging
}


// Call the extraction function when the script runs
extractReviewsFromPage();

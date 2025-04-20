# Amazon Review Classifier Extension

A simple Chrome extension that classifies Amazon product reviews into four categories using Google Chrome's built-in AI model:

- ✅ Positive  
- ❌ Negative  
- 📌 Requirement  
- ⚪ Neutral

The extension displays a popup with the total count of each category, helping users quickly understand product sentiment at a glance.

---

## ✨ Features

- 🧠 Powered by Chrome's built-in AI model (no external APIs or libraries required)
- ⚡ Fast in-browser classification
- 📊 Real-time category count display in popup
- 🧩 Lightweight and privacy-friendly (runs entirely on-device)

---

## 🛠 How It Works

1. The extension scans the reviews on an Amazon product page.
2. It passes the review texts to Chrome's built-in AI helper.
3. Based on your custom-defined labels (`positive`, `negative`, `requirement`, `neutral`), the AI classifies each review.
4. The counts are shown neatly in the popup window.

---

## 📦 Installation

1. Clone this repository.
2. Go to `chrome://extensions/` in your Chrome browser(Chrome Canary).
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the folder.

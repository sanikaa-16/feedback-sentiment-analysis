# 📝 Feedback Analysis System

A smart and secure feedback analysis tool powered by OpenAI API, designed to collect, categorize, and analyze user feedback in real-time. The system features a clean UI for collecting feedback, ensures toxicity and spam filtering, provides developer suggestions, and visualizes insights via a Firebase-powered analytics dashboard.

---

## 🚀 Features

* 🧠 **AI-Powered Analysis**: Uses OpenAI API to generate:

  * Suggestions for developers to improve products based on user feedback.
  * Categorization of feedback into predefined types (e.g., Bug, Feature Request, UI, Performance, etc.).

* 🛑 **Toxicity and Spam Detection**: Filters out toxic or spam content using:

  * OpenAI moderation endpoint or a custom-trained filter.
  * Feedback is stored only if it passes the safety checks.

* 📬 **Interactive UI**:

  * Simple and intuitive interface for users to submit feedback.
  * Displays a thank-you/user message upon submission.

* 📊 **Firebase Dashboard**:

  * Stores all valid feedback in Firebase Firestore.
  * Real-time dashboard for admins/developers showing:

    * Feedback trends over time
    * Category distribution
    * Most common suggestions

---

## 🛠️ Tech Stack

| Component       | Technology                             |
| --------------- | -------------------------------------- |
| Frontend        | HTML/CSS, JavaScript / React.js        |
| Backend/API     | Node.js / Express / Firebase Functions |
| AI Processing   | OpenAI GPT API                         |
| Database        | Firebase Firestore                     |
| Auth (optional) | Firebase Authentication                |
| Deployment      | Firebase Hosting / Vercel / Netlify    |

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/feedback-analysis.git
cd feedback-analysis
```

### 2. Install Dependencies

For frontend:

```bash
cd client
npm install
```

For backend (if using server):

```bash
cd server
npm install
```

### 3. Environment Variables

Create a `.env` file for both frontend and backend:

#### `.env` (backend/server)

```env
OPENAI_API_KEY=your-openai-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

#### `.env` (frontend/client)

```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 4. Firebase Setup

* Enable **Firestore** in Firebase console
* Optionally set up **Authentication** if restricting access
* Configure Firestore rules to restrict unauthorized write access

### 5. Run the App

**Frontend:**

```bash
npm start
```

**Backend (if separate):**

```bash
npm run dev
```

---

## 🧠 OpenAI API Integration

* Uses Llama-3 to:

  * Summarize and categorize user feedback
  * Suggest developer action items
  * Detect toxicity/spam via `moderation` endpoint

Example API call:

```js
const response = await openai.createChatCompletion({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant that analyzes feedback." },
    { role: "user", content: userFeedback }
  ]
});
```

---

## 🔒 Security & Validation

* Feedback goes through a content moderation pipeline:

  * Uses OpenAI’s moderation API or a custom heuristic to detect:

    * Toxicity
    * Spam / Unrelated messages
* If flagged, the feedback is **not stored** in the database

---

## 📊 Dashboard Features

* Total feedback entries
* Feedback category breakdown (Pie chart)
* Trend over time (Line chart)
* Most common keywords (Tag cloud)
* Export as CSV (optional)

---

## 📁 Folder Structure

```bash
feedback-analysis/
├── client/                # Frontend (React or Vanilla)
│   └── ...
├── server/                # Backend API (Express / Firebase Functions)
│   └── ...
├── firebase.json          # Firebase config
├── README.md              # You're here
└── .env                   # Environment variables
```

---

## ✨ Future Enhancements

* Sentiment analysis for emotional tone
* Email alerts to devs for critical feedback
* Role-based dashboard for team collaboration
* Feedback thread or reply system

---

## 🤝 Contributing

Pull requests and suggestions are welcome! Please fork the repo and open a PR with clear commit messages.

---

## 📜 License

MIT License – see [`LICENSE`](LICENSE) file for details.

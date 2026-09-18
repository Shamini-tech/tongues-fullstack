Tongues — Full-Stack Translation Application

Tongues is a full-stack, real-time translation web application built with React, Node.js, and Express. It offers dynamic multi-language translation, voice input/output capabilities, and a robust failover architecture that gracefully handles rate limits and API service disruptions.

🌟 Key Features

Real-time Translation: Automatic translation with 500ms debouncing to optimize API usage.

Two-Tier Failover System: Primary calls are routed to Google Translate. If rate-limited (HTTP 429) or unavailable, the backend seamlessly falls back to the MyMemory API.

Race Condition Mitigation: Uses React useRef sequence counters to ensure asynchronous response ordering during rapid typing.

Speech-to-Text (STT): Voice dictation in selected input languages via the native Web Speech Recognition API (webkitSpeechRecognition).

Text-to-Speech (TTS): Spoken output synthesis using the SpeechSynthesis Web API with automatic queue management (window.speechSynthesis.cancel()).

Interactive UI: One-click language swapping, clipboard copying, character counter (max 500), and quick language select chips.

🛠️ Tech Stack

Frontend

Library: React 18 (Vite)

Styling: Custom CSS3 with responsive glassmorphism aesthetic

APIs: Web Speech API (SpeechRecognition, SpeechSynthesis), Clipboard API

Backend

Runtime: Node.js (ES Modules)

Framework: Express.js

Middleware: CORS, Express JSON parser

HTTP Client: node-fetch

🏗️ System Architecture & Data Flow

+-----------------------------------------------------------------------+
|                            FRONTEND (React)                           |
|  - Manages UI State (sourceText, sourceLang, targetLang)              |
|  - Input Debouncing (500ms)                                           |
|  - Race Condition Tracking via useRef(sequenceCounter)                |
+-----------------------------------------------------------------------+
                                   |
                         HTTP POST /api/translate
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            BACKEND (Express)                          |
|  - Acts as a CORS proxy                                                |
|  - Receives payload: { text, sourceCode, targetCode }                  |
+-----------------------------------------------------------------------+
                                   |
                  +----------------+----------------+
                  |                                 |
                  v (Primary)                       v (Fallback)
      +------------------------+       +------------------------+
      |  Google Translate API  |       |      MyMemory API      |
      +------------------------+       +------------------------+
                  |                                 |
           (If Status 200)                   (If Google Fails/429)
                  |                                 |
                  +----------------+----------------+
                                   |
                         Returns Translated JSON
                                   |
                                   v
+-----------------------------------------------------------------------+
|                        DISPLAY TRANSLATED TEXT                        |
+-----------------------------------------------------------------------+


🚀 Getting Started

Follow these steps to set up and run the project locally.

Prerequisites

Node.js (v16.0 or higher recommended)

npm (v7.0 or higher)

1. Clone the Repository

git clone https://github.com/Shamini-tech/tongues-fullstack.git
cd tongues-fullstack


2. Backend Setup

# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start


The backend server will run on http://localhost:5000.

3. Frontend Setup

Open a new terminal window/tab:

# Navigate to frontend folder from root directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev


The React app will launch on http://localhost:5173.

📂 Project Structure

tongues-fullstack/
├── backend/
│   ├── server.js          # Express app, endpoint routing, and failover translation logic
│   └── package.json       # Backend dependencies and scripts
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component with UI, state, STT/TTS logic, and debouncing
    │   ├── languages.js   # Supported languages dictionary and quick selection presets
    │   ├── App.css        # Core styling and animations
    │   ├── index.css      # Baseline CSS reset
    │   └── main.jsx       # React application entry point
    ├── index.html         # HTML document shell
    └── package.json       # Frontend dependencies and scripts


🛡️ Key Technical Highlights for Reviewers

Defensive Failover Handling: Demonstrates resilience engineering by handling third-party API rate limits gracefully without exposing server errors to the end-user.

Optimized Web Requests: Implements 500ms debouncing on input typing to reduce unnecessary network traffic and API consumption.

Asynchronous Race Protection: Protects state synchronization against out-of-order network responses using persistent useRef sequence IDs.

Native Browser Integrations: Utilizes built-in browser APIs (window.speechSynthesis and webkitSpeechRecognition) for accessibility and voice features without adding heavy external library overhead.

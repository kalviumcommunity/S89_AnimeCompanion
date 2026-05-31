# Anime Companion - AI Anime Chatbot

## Live Demo

https://animecompanion8.netlify.app/

---

# Overview

Anime Companion is an AI-powered anime chatbot built using React.js, Node.js, MongoDB, and Gemini API. The application helps users explore anime through intelligent conversations, recommendations, episode summaries, character information, and anime trivia.

The system uses a Hybrid RAG (Retrieval-Augmented Generation) architecture that combines MongoDB-stored anime data with real-time Google Search results to generate fast, accurate, and context-aware responses.

---

# Features

## AI Anime Chatbot

* Conversational anime assistant
* Ask questions about:

  * Anime characters
  * Episodes
  * Story lore
  * Recommendations
  * Anime trivia

## Hybrid RAG System

* Combines:

  * Local MongoDB knowledge base
  * Real-time Google Search
* Improves response accuracy and freshness

## Function Calling System

Uses structured backend tools such as:

* `get_anime_summary`
* `get_character_info`

This ensures reliable and structured responses instead of hallucinated AI outputs.

## Structured JSON Responses

* AI responses are generated in JSON format
* Parsed and rendered cleanly in the frontend UI
* Dedicated recommendation display system

## Authentication & Security

* JWT-based authentication system
* Secure login and logout functionality
* Persistent user sessions

## Conversation Management

* Stores conversation history
* Delete chat history functionality
* Context-aware conversations

## Personalized Recommendations

* Recommendations generated using:

  * Previous conversations
  * User interaction history
  * Anime preferences

---

# Tech Stack

## Frontend

* React.js
* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## APIs & AI Tools

* Gemini API (LLM)
* Google Search Integration
* Local Database Injection

---

# Deployment

* Frontend: Netlify
* Backend: Render

---

# System Workflow

## Step 1: Authentication

Users securely log in using JWT authentication.

## Step 2: User Query

Frontend sends user prompts to the backend API.

## Step 3: Hybrid Retrieval

The backend combines:

* MongoDB anime data
* Google Search results
* Gemini API reasoning

to generate accurate responses.

## Step 4: Structured Output

Responses are generated in structured JSON format and rendered dynamically in the UI.

## Step 5: Conversation Memory

User chat history is stored to improve future recommendations and contextual understanding.

---

# Installation & Setup

## Clone Repository

```bash id="usgsh5"
git clone https://github.com/your-username/anime-companion.git
```

## Install Frontend Dependencies

```bash id="jlwmr3"
cd client
npm install
```

## Install Backend Dependencies

```bash id="f04iho"
cd server
npm install
```

## Run Frontend

```bash id="qjxekf"
npm run dev
```

## Run Backend

```bash id="zhxutl"
npm start
```

---

# Environment Variables

Create a `.env` file inside the server folder:

```env id="b93u3o"
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_SEARCH_API_KEY=your_google_api_key
```

---

# Future Enhancements

* Voice-enabled anime conversations
* Progressive Web App (PWA) support
* Mobile optimization
* Community recommendation system
* Shared anime watchlists
* AI-powered anime mood detection

---

# Author

## Thamarana Satya Durga Prasad

* GitHub: https://github.com/TSDPRASAD88
* LinkedIn: www.linkedin.com/in/satya-durga-prasad-thamarana-a65324326
---

# Final Note

Anime Companion was built to create an intelligent and engaging anime assistant capable of delivering accurate anime information, personalized recommendations, and context-aware conversations using modern AI and full-stack technologies.

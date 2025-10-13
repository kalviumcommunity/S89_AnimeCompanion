## Anime Companion – AI Anime Chatbot

Anime Companion is an intelligent anime-focused chatbot built with Node.js, React.js, and Gemini API, designed to provide accurate and engaging responses about anime. It helps users get episode summaries, anime recommendations, character information, and deep trivia, using hybrid RAG (Retrieval-Augmented Generation) for fast and reliable answers.

## Features

* Conversational Chatbot – Ask anything about anime (characters, episodes, lore, recommendations).
* Hybrid RAG System – Combines local MongoDB data with Google Search for accurate and updated responses.
* Function Calling – Uses structured tools like get_anime_summary & get_character_info for reliable results.
* Structured JSON Output – Responses are formatted and displayed cleanly in a dedicated recommendations page.
* Secure Authentication – JWT-based login/logout system with persistent conversation history.
* Conversation Management – Users can delete chat history through functional UI routes.
* Context-Aware Recommendations – Generates suggestions using conversation history instead of static profiles.

## Tech Stack

# Frontend:HTML, CSS, JavaScript, React.js
# Backend:Node.js, Express.js, MongoDB (Mongoose)
# APIs & Tools:Gemini API (LLM),Google Search (real-time data),Local DB Injection for faster responses

## Deployment:

* Frontend: Netlify
* Backend: Render

# How It Works

* Authentication – Users log in securely using JWT; sessions persist across chats.
* User Query – Frontend sends prompts to the backend, which connects to Gemini API.
* Hybrid Retrieval – System combines local MongoDB data and Google Search for enhanced context.
* Structured Response – Gemini outputs JSON-formatted data, parsed and rendered in UI.
* History & Cleanup – Chat history is stored for context and can be deleted when needed.

# Future Enhancements

* Voice Support for anime chat interactions.
* PWA Support for offline and mobile-friendly use.
* Community Mode for shared watchlists and recommendations.

# This project is open-source and free to use for personal and learning purposes.
🧠 AI Chat App with Long-Term Memory
A full-stack, ChatGPT-like web application that not only answers questions but remembers the context of your conversations using a powerful Retrieval-Augmented Generation (RAG) architecture.

Note: Replace the link above with a real screenshot of your application.

✨ Key Features
This isn't just another ChatGPT clone. It's built with an advanced architecture to provide a seamless and intelligent user experience.

🧠 Conversational Memory: Powered by Pinecone vector database, the app remembers previous messages to provide context-aware responses in long conversations.

🚀 Real-time Communication: Instant message delivery and AI responses using Socket.IO.

🤖 Intelligent AI: Integrated with Google's Gemini Pro for high-quality, human-like text generation.

🔐 Secure User Authentication: Full user registration and login system to keep your chats private and secure.

✍️ Full CRUD Functionality:

Create, read, update, and delete entire chat sessions.

Edit your own messages even after sending them to get a refined AI response.

💅 Modern UI/UX:

A clean, professional, and fully responsive user interface.

Markdown support for rich text formatting, including code blocks with syntax highlighting.

Switch between Light and Dark themes.

🛠️ Tech Stack
This project is built using the MERN stack and other modern technologies.

Frontend

Backend

Database & AI

React.js (with Vite)

Node.js

MongoDB (for user/chat data)

Redux Toolkit (for State Management)

Express.js

Pinecone (for Vector Storage/Memory)

Socket.IO Client

Socket.IO Server

Google Gemini Pro (AI Model)

Axios

JWT (for Authentication)



React Markdown

Mongoose



🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v18 or later)

npm

Git

1. Clone the Repository
git clone [https://github.com/YourUsername/Your-Repository-Name.git](https://github.com/YourUsername/Your-Repository-Name.git)
cd Your-Repository-Name

2. Backend Setup
# Navigate to the backend folder
cd Backend

# Install dependencies
npm install

# Create a .env file and add your secret keys
touch .env

Your Backend/.env file should look like this:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# Run the backend server
npm run dev

3. Frontend Setup
# Navigate to the frontend folder from the root directory
cd Frontend

# Install dependencies
npm install

# Run the frontend development server
npm run dev

Your application should now be running at http://localhost:5173 (or another port specified by Vite).

📄 License
This project is open-source and available under the MIT License.

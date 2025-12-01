# 🍵 TeaChat - Real-Time Collaboration Platform

TeaChat is a full-stack, real-time messaging application designed for seamless team collaboration. Built as a Slack-like alternative, it allows users to create channels, chat instantly, and see team presence in real-time.

**Deployed Frontend:** [INSERT_YOUR_RENDER_FRONTEND_URL_HERE]
**Deployed Backend:** [INSERT_YOUR_RENDER_BACKEND_URL_HERE]

---

## 🚀 Features

### Core Requirements
- **🔐 User Accounts:** Secure Sign Up and Login with JWT authentication and persistent sessions.
- **📢 Channels:** Create, view, and join topic-based channels.
- **⚡ Real-Time Messaging:** Instant message delivery using WebSockets (Socket.IO).
- **🟢 Online Presence:** Real-time online/offline status indicators for all users.
- **📜 Message History:** Persistent chat history stored in PostgreSQL.
- **🔄 Pagination:** "Load Previous Messages" feature to fetch older history efficiently.

### Bonus Features (Optional Add-ons)
- **✨ Typing Indicators:** Real-time visual cue when another user is typing.
- **🗑️ Message Deletion:** Users can delete their own messages instantly.
- **🔍 Local Search:** Filter messages within a channel using the search bar.
- **🎨 Modern UI:** Fully responsive design with Framer Motion animations and a professional landing page.

---

## 🛠️ Tech Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Database:** PostgreSQL (using `databases` and `asyncpg` for async access)
- **Real-Time:** Python-SocketIO (ASGI)
- **Authentication:** PyJWT & Passlib (Bcrypt hashing)

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Real-Time:** Socket.IO Client
- **Routing:** React Router DOM
- **HTTP Client:** Axios

---

## ⚙️ Setup & Run Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js & npm
- PostgreSQL (Local or Cloud)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in /backend with the following:
# DATABASE_URL=postgresql://user:password@localhost:5432/teachat
# JWT_SECRET=your_secret_key
# FRONTEND_ORIGIN=http://localhost:5173

# Initialize Database
python src/fix_db.py
python src/fix_messages.py

# Run Server
uvicorn src.main:app --reload --port 4000

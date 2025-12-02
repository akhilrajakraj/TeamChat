This is **Senior Architect**.

Here is the complete, well-structured `README.md` file. It consolidates all the technical details, features, and setup instructions from our session into a professional document ready for your GitHub repository.

### **Instructions**

1.  Open **VS Code**.
2.  Create/Open the file named **`README.md`** in your project root (`TeaChat/`).
3.  **Copy and paste** the entire block below.
4.  Save and push to GitHub.

-----

````markdown
# 🍵 TeaChat - Real-Time Team Collaboration Platform

**TeaChat** is a full-stack, real-time messaging application designed to facilitate seamless team communication. Built with performance and scalability in mind, it features instant messaging, channel management, and live presence tracking, packaged in a modern, responsive interface.

![Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React-blue)
![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo
- **Frontend Application:** [https://teachat-frontend.onrender.com](https://teachat-frontend.onrender.com)
- **Backend API:** [https://teachat-backend.onrender.com](https://teachat-backend.onrender.com)

---

## ✨ Key Features

### 🌟 Core Functionality
- **Real-Time Messaging:** Instant delivery using **WebSockets (Socket.IO)**.
- [cite_start]**Channel System:** Users can create, join, and switch between topic-based channels dynamically[cite: 3582].
- [cite_start]**User Authentication:** Secure **JWT-based** Sign Up and Login with persistent sessions[cite: 3576].
- [cite_start]**Message History:** Efficient **Pagination** support to load previous conversations without performance impact[cite: 3601].
- [cite_start]**Live Presence:** Real-time **Online/Offline** status indicators for all users[cite: 3598].

### 🎁 Bonus Features (Implemented)
- [cite_start]**👀 Typing Indicators:** Visual cues show when other users are typing in the current channel[cite: 3614].
- [cite_start]**🗑️ Message Deletion:** Users can delete their own messages instantly, syncing removal across all clients[cite: 3615].
- [cite_start]**📱 Fully Responsive:** Mobile-first design with a collapsible sidebar and touch-friendly interface for phone users[cite: 2929].
- [cite_start]**🔍 Message Search:** Client-side filtering to find specific messages within a channel instantly[cite: 3616].
- [cite_start]**🎨 Modern UI:** Built with **Tailwind CSS** and **Framer Motion** for smooth transitions, animations, and a glassmorphism aesthetic[cite: 3217].

---

## 🛠️ Tech Stack

### **Frontend**
- [cite_start]**Framework:** React 18 (Vite) [cite: 35]
- [cite_start]**Styling:** Tailwind CSS + Lucide React (Icons) [cite: 2201]
- [cite_start]**Animations:** Framer Motion [cite: 3218]
- [cite_start]**Network:** Axios (API) + Socket.io-client (Real-time) [cite: 2201]

### **Backend**
- [cite_start]**Framework:** FastAPI (Python 3.11) [cite: 36]
- [cite_start]**Database:** PostgreSQL 16 [cite: 49]
- [cite_start]**Real-Time:** Python-SocketIO (ASGI) [cite: 48]
- [cite_start]**Security:** BCrypt (Password Hashing) + PyJWT (Token generation) [cite: 45, 46]
- [cite_start]**Async Driver:** AsyncPG + Databases [cite: 41]

---

## ⚙️ Local Setup Instructions

Follow these steps to run the project locally on your machine.

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL installed and running locally

### 1. Clone Repository
```bash
git clone [https://github.com/akhilrajakraj/TeamChat.git](https://github.com/akhilrajakraj/TeamChat.git)
cd TeaChat
````

### 2\. Backend Setup

Navigate to the backend folder and set up the Python environment.

```bash
cd backend

# Create Virtual Environment
python -m venv .venv

# Activate Virtual Environment
# Windows:
.\.venv\Scripts\Activate
# Mac/Linux:
# source .venv/bin/activate

# Install Dependencies
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend/` directory with the following variables:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/teachat
JWT_SECRET=your_super_secret_key
FRONTEND_ORIGIN=http://localhost:5173
```

**Initialize Database:**

```bash
# Run the setup scripts to create tables
python src/fix_db.py
python src/fix_messages.py

# Start the Server
uvicorn src.main:app --reload --port 4000
```

### 3\. Frontend Setup

Open a new terminal, navigate to the frontend folder, and start the UI.

```bash
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```

Visit `http://localhost:5173` in your browser to start chatting\!

-----

## 🧠 Design Decisions & Trade-offs

1.  **Hardcoded Cloud URL for Mobile Stability:**
    To ensure absolute connectivity on mobile networks where environment variable injection can sometimes fail in static builds, the Cloud Backend URL is explicitly defined in the frontend configuration. This guarantees the phone app always finds the server.

2.  **Optimistic UI Updates:**
    The chat interface updates immediately upon sending a message, rather than waiting for the server round-trip. This ensures the app feels "native" and instant, even on slower 4G connections.

3.  **Polling Fallback:**
    Socket.IO is configured to support both WebSocket and HTTP Polling. This guarantees connectivity even behind strict corporate firewalls or proxies that might block raw WebSockets.

4.  **Security Architecture:**

      - Passwords are hashed using **BCrypt** before storage.
      - API endpoints are protected via **JWT (JSON Web Tokens)**.
      - Socket events validate ownership (e.g., only the author can delete a message).

-----

## 👤 Author

**Akhil Raj**
*Full-Stack Developer Internship Assignment*

```
```
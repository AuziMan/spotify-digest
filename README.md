# Spotify Digest 🎧

A full-stack application that connects to the Spotify API to display a user’s listening data, including top artists and currently playing tracks.

## 🚀 Tech Stack

* **Frontend:** React
* **Backend:** Flask (Python)
* **API:** Spotify Web API
* **Auth:** OAuth 2.0 (Authorization Code Flow)

---

## 📁 Project Structure

```
spotify-digest/
├── backend/        # Flask API
├── frontend/       # React app
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

* Node.js (v18+ recommended)
* npm
* Python 3.8+
* pip

---

## 🖥️ Backend Setup (Flask)

```
cd backend
pip install -r requirements.txt
python3 app.py
```

The backend will run on:

```
http://127.0.0.1:4000
```

---

## 🌐 Frontend Setup (React)

```
cd frontend
npm install
npm start
```

The frontend will run on:

```
http://localhost:3000
```

---

## 🔗 Proxy Setup (IMPORTANT)

In `frontend/package.json`, add:

```
"proxy": "http://127.0.0.1:4000"
```

This allows React to communicate with Flask without CORS issues.

---

## 🔑 Authentication Flow

1. User clicks **Login with Spotify**
2. React redirects to Flask `/auth/login`
3. Flask redirects to Spotify OAuth
4. Spotify redirects back to `/callback`
5. Flask stores tokens in session
6. User is redirected back to React
7. React fetches data from Flask endpoints

---

## 📡 API Endpoints

### Auth

* `GET /auth/login` → Redirect to Spotify login
* `GET /auth/callback` → Handle Spotify callback


## 🧪 Running the App

1. Start backend
2. Start frontend
3. Open browser:

```
http://localhost:3000
```

4. Click **Login with Spotify**

---

## ⚠️ Notes

* Do NOT commit your `.env` file
* This project uses Flask sessions (not production-ready auth yet)
* For production, HTTPS is required (ngrok or deployment)

---


## 👨‍💻 Author

Austin Driver

---

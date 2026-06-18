# ⚡ TaskPro: Advanced Student Productivity Ecosystem

**TaskPro** is a professional-grade, full-stack task management application developed as a 45-day internship final project. It serves as a high-performance workspace where students can manage assignments, track productivity through behavioral tools, and receive automated cloud-dispatched notifications.

## 🚀 Live Links
- **Frontend (Production):** https://taskpro-app6.vercel.app/
- **Backend (API):** https://taskpro.up.railway.app

---

## 🛠️ Technical Architecture

### 💻 Frontend (The UI Layer)
- **Library:** React.js (Functional Components & Hooks)
- **Styling:** Tailwind CSS (Glassmorphism design language)
- **Animations:** Framer Motion (Staggered list loads & layout transitions)
- **Routing:** React Router DOM v6 (Multi-page architecture)
- **State Management:** LocalStorage + Cloud Sync for persistent user preferences.

### 🧠 Backend (The Logic Layer)
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas (Utilizing the **Native MongoDB Driver** for maximum performance)
- **Security:** JWT (JSON Web Tokens) for stateless auth and Bcrypt for sensitive data hashing.
- **Infrastructure:** Hosted on Railway with **Outbound IPv6** enabled for modern mail server compatibility.
- **Automation:** Nodemailer integrated with Google SMTP for real-time task dispatches.

---

## ✨ Key Features
- **Permanent Profile Sync:** Usernames, Custom Avatars (Dicebear API), and UI Themes are saved directly to the Cloud DB.
- **Email Notification Engine:** Instant HTML email dispatches upon task creation.
- **Calendar Integration:** One-click Google Calendar synchronization nodes.
- **Behavioral Focus Tools:** Integrated Pomodoro Timer (25/5 rule) and time-aware Greeting/Quote engine.
- **Data Triage:** Priority-based color coding (High/Medium/Low) with 18px border indicators.
- **Responsive Geometry:** Custom Flexbox/Grid layouts ensure compatibility from mobile to 4K displays.

---

## ⚙️ Installation & Setup

1. **Clone the Repo:** `git clone https://github.com/yesaswim06/Taskpro-.git`
2. **Backend:** 
   - `cd backend && npm install`
   - Configure `.env` with `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS`.
   - Start: `node server.js`
3. **Frontend:**
   - `cd frontend && npm install`
   - Start: `npm start`
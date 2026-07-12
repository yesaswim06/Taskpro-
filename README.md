# ⚡ TaskPro: Advanced Student Productivity Ecosystem

**TaskPro** is a professional-grade, full-stack task management application developed as a **45-day internship final project** under the **Avishkarana Andhra Summer Internship**. It serves as a high-performance workspace where students can manage assignments, track productivity through behavioral tools, and receive automated cloud-dispatched notifications.

---

## 🚀 Live Links

- **Frontend (Production):** [taskpro-app6.vercel.app](https://taskpro-app6.vercel.app/)
- **Backend (API):** [taskpro.up.railway.app](https://taskpro.up.railway.app)

---

## 🛠️ Technical Architecture

### 💻 Frontend (The UI Layer)
- **Library:** React.js (Functional Components & Hooks)
- **Styling:** Tailwind CSS (Glassmorphism design language)
- **Animations:** Framer Motion (Staggered list loads & layout transitions)
- **Routing:** React Router DOM v6 (Multi-page architecture)
- **State Management:** LocalStorage + Cloud Sync for persistent user preferences

### 🧠 Backend (The Logic Layer)
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas (Utilizing the **Native MongoDB Driver** for maximum performance)
- **Security:** JWT (JSON Web Tokens) for stateless auth and Bcrypt for sensitive data hashing
- **Infrastructure:** Hosted on Railway with **Outbound IPv6** enabled for modern mail server compatibility
- **Automation:** Nodemailer integrated with Google SMTP for real-time task dispatches

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Permanent Profile Sync** | Usernames, Custom Avatars (Dicebear API), and UI Themes are saved directly to the Cloud DB |
| 📧 **Email Notification Engine** | Instant HTML email dispatches upon task creation |
| 📅 **Calendar Integration** | One-click Google Calendar synchronization nodes |
| ⏱️ **Behavioral Focus Tools** | Integrated Pomodoro Timer (25/5 rule) and time-aware Greeting/Quote engine |
| 🎨 **Data Triage** | Priority-based color coding (High/Medium/Low) with 18px border indicators |
| 📱 **Responsive Geometry** | Custom Flexbox/Grid layouts ensure compatibility from mobile to 4K displays |

---

## 🗂️ Tech Stack Summary

```
Frontend   : React.js, Tailwind CSS, Framer Motion, React Router DOM v6
Backend    : Node.js, Express.js
Database   : MongoDB Atlas (Native Driver)
Auth       : JWT + Bcrypt
Email      : Nodemailer + Google SMTP
Hosting    : Vercel (Frontend) · Railway (Backend)
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yesaswim06/Taskpro-.git
cd Taskpro-
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The app should now be running locally, with the frontend connecting to your local or deployed backend API.

---

## 📁 Project Structure

```
Taskpro-/
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── public/
└── README.md
```

---

## 👤 Author

**Naga Yesaswi Bhargav Mudigonda**
B.Tech Information Technology, NRI Institute of Technology
- GitHub: [@yesaswim06](https://github.com/yesaswim06)
- LinkedIn: [www.linkedin.com/in/yesaswim06](https://www.linkedin.com/in/yesaswim06/) 

---

## 📜 License

This is Mini project was developed as part of the **Avishkarana Andhra Summer Internship** program and is intended for educational and portfolio purposes.

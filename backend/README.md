# 🧠 TaskPro Backend (API Node)

This is the logic layer of the TaskPro ecosystem. Built with Node.js and Express, it handles secure authentication, database orchestration, and automated email dispatching.

## 🚀 Technical Highlights
- **Engine:** Node.js / Express.js.
- **Database:** MongoDB Atlas utilizing the **Native MongoDB Driver** for high-performance, low-latency queries.
- **Security:** Industry-standard **JWT (JSON Web Tokens)** for stateless authentication and **Bcrypt** for password hashing.
- **Email System:** Integrated **Nodemailer** with a non-blocking asynchronous pattern to ensure UI responsiveness.
- **Infrastructure:** Hosted on Railway with **Outbound IPv6** enabled to support modern secure mail handshakes with Google SMTP.

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create new student profile.
- `POST /api/auth/login` - Secure access gateway.
- `PUT /api/auth/update-profile` - Permanent cloud sync for Name, Theme, and Avatar.

### Task Management
- `GET /api/tasks` - Fetch user-specific assignments.
- `POST /api/tasks` - Deploy new task (triggers background email + calendar node).
- `PUT /api/tasks/:id` - Update completion status.
- `DELETE /api/tasks/:id` - Remove node from database.

## ⚙️ Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=internship_secret_key_99
EMAIL_USER=myselfadmin123@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
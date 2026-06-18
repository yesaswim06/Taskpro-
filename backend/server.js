import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// 1. Load Config
dotenv.config();

// 2. Initialize App (This MUST be at the top)
const app = express();

// 3. Middlewares
// REPLACE your old app.use(cors(...)) with this:
app.use(cors({
  origin: "*", // This allows Netlify, Vercel, and Localhost to all work at once
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-auth-token"]
}));
app.use(express.json());

// 4. Database Setup
const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "StudentTaskDB";
let db;

// 5. Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ... existing imports (nodemailer, etc.)

// --- IMPROVED EMAIL FUNCTION WITH CALENDAR LINK ---
const sendTaskEmail = async (userEmail, userName, task) => {
  // Generate Calendar Link for Email
  const gCalTitle = encodeURIComponent(task.title);
  const gCalDate = task.dueDate.replace(/-/g, '') + "T090000Z";
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gCalTitle}&dates=${gCalDate}/${gCalDate}`;

  const mailOptions = {
    from: `"TaskPro Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `📌 New TaskPro Assignment: ${task.title}`,
    html: `
      <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; max-width: 500px;">
        <h2 style="color: #4f46e5;">Hello ${userName}!</h2>
        <p>A new task has been deployed to your workspace.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <p><strong>Project:</strong> ${task.title}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
        <a href="${calendarUrl}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
          Add to Google Calendar
        </a>
        <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">TaskPro Ecosystem • Internship Final Build</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email + Calendar Link sent to ${userEmail}`);
  } catch (err) { console.error("❌ Email Error:", err.message); }
};

// ... Ensure Task POST route calls this ...

// 6. DB Connection
async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ SUCCESS: Connected to MongoDB Cloud (Atlas)");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  } catch (error) {
    console.error("❌ DB ERROR:", error);
  }
}
main();

// --- 7. ROUTES (Now 'app' is initialized, so these will work) ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      name, 
      email, 
      password: hashedPassword, 
      themeColor: 'indigo', 
      avatarSeed: 'Felix' 
    };
    const result = await db.collection("users").insertOne(newUser);
    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET);
    res.json({ token, user: { name, email, themeColor: 'indigo', avatarSeed: 'Felix' } });
  } catch (err) { res.status(500).json({ msg: "Register failed" }); }
});

app.put("/api/auth/update-name", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, "secret_key");
  await db.collection("users").updateOne(
    { _id: new ObjectId(decoded.id) },
    { $set: { name: req.body.newName } }
  );
  res.json({ msg: "Name updated" });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        name: user.name, 
        email: user.email, 
        themeColor: user.themeColor || 'indigo', 
        avatarSeed: user.avatarSeed || 'Felix' 
      } 
    });
  } catch (err) { res.status(500).json({ msg: "Login failed" }); }
});

// Add this route to your backend/server.js
app.put("/api/auth/update-profile", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, "secret_key");
    const { name, themeColor, avatarSeed } = req.body;
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { name, themeColor, avatarSeed } }
    );
    res.json({ msg: "Profile Synced to Cloud" });
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
});

app.get("/api/tasks", async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("No token");
  const decoded = jwt.verify(token, "secret_key");
  const tasks = await db.collection("tasks").find({ userId: new ObjectId(decoded.id) }).toArray();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, "secret_key");
  const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
  
  const newTask = { ...req.body, userId: new ObjectId(decoded.id), status: "Pending" };
  const result = await db.collection("tasks").insertOne(newTask);
  const savedTask = { ...newTask, _id: result.insertedId };

  if (user) sendTaskEmail(user.email, user.name, savedTask);
  res.json(savedTask);
});

app.put("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } });
  res.json({ msg: "Updated" });
});

app.delete("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ msg: "Deleted" });
});

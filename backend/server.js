import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// 1. Initialize Configuration
dotenv.config();
const app = express();

// 2. FIX CORS (Allows Netlify to talk to Railway)
app.use(cors({
  origin: "*", // Allows any website to access this API - best for internship demo
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-auth-token"]
}));

app.use(express.json());

// 3. Database Connection Constants
const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "StudentTaskDB";
let db;

// 4. Email Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 5. Email Function with Google Calendar Link
const sendTaskEmail = async (userEmail, userName, task) => {
  const gCalTitle = encodeURIComponent(task.title);
  const gCalDate = task.dueDate.replace(/-/g, '') + "T090000Z";
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gCalTitle}&dates=${gCalDate}/${gCalDate}`;

  const mailOptions = {
    from: `"TaskPro Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `📌 TaskPro: New Assignment Deployed!`,
    html: `
      <div style="font-family: sans-serif; padding: 25px; border: 2px solid #6366f1; border-radius: 20px; max-width: 500px;">
        <h2 style="color: #6366f1;">Hello ${userName}!</h2>
        <p>A new project has been added to your dashboard.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <p><strong>Project:</strong> ${task.title}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
        <a href="${calendarUrl}" style="background: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
          Add to Google Calendar
        </a>
        <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">TaskPro Ecosystem • Internship Build v1.0</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email + Calendar Link sent to ${userEmail}`);
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
};

// 6. Connect to MongoDB and Start Server
async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ SUCCESS: Connected to MongoDB Cloud (Atlas)");
    
    // Health Check Route
    app.get("/", (req, res) => res.send("TaskPro API is Live and Running! ✅"));

    app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("❌ CONNECTION ERROR:", error);
  }
}
main();

// --- 7. AUTH ROUTES ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({ 
      name, 
      email, 
      password: hashedPassword,
      themeColor: 'indigo',
      avatarSeed: 'Felix'
    });
    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET);
    res.json({ token, user: { name, email, themeColor: 'indigo', avatarSeed: 'Felix' } });
  } catch (err) { res.status(500).json({ msg: "Register failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
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

// Sync Name, Theme, and Avatar to Cloud
app.put("/api/auth/update-profile", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, themeColor, avatarSeed } = req.body;
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { name, themeColor, avatarSeed } }
    );
    res.json({ msg: "Synced" });
  } catch (err) { res.status(500).json({ msg: "Update failed" }); }
});

// --- 8. TASK ROUTES ---

app.get("/api/tasks", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tasks = await db.collection("tasks").find({ userId: new ObjectId(decoded.id) }).toArray();
    res.json(tasks);
  } catch (err) { res.status(401).send("Unauthorized"); }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    
    const newTask = { ...req.body, userId: new ObjectId(decoded.id), createdAt: new Date() };
    const result = await db.collection("tasks").insertOne(newTask);
    const savedTask = { ...newTask, _id: result.insertedId };

    if (user) sendTaskEmail(user.email, user.name, savedTask);
    res.json(savedTask);
  } catch (err) { res.status(500).json({ msg: "Error saving task" }); }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } });
    res.json({ msg: "Updated" });
  } catch (err) { res.status(500).json({ msg: "Update failed" }); }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ msg: "Deleted" });
  } catch (err) { res.status(500).json({ msg: "Delete failed" }); }
});
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

// --- 1. INDUSTRIAL STRENGTH CORS ---
app.use(cors({ origin: "*" }));
app.use(express.json());

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "StudentTaskDB";
let db;

// --- 2. HARDENED EMAIL ENGINE (Background Mode) ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 5000 // Short timeout to prevent server hanging
});

const sendTaskEmail = async (userEmail, userName, task) => {
  const gLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`;
  
  const mailOptions = {
    from: `"TaskPro" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `📌 TaskPro Assignment: ${task.title}`,
    html: `<div style="font-family:sans-serif;padding:20px;border-radius:15px;border:1px solid #6366f1;">
            <h2>Hi ${userName}!</h2>
            <p>New task added with <b>${task.priority}</b> priority.</p>
            <p>Description: ${task.description || "N/A"}</p>
            <a href="${gLink}" style="background:#6366f1;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;display:inline-block;margin-top:10px;">Add to Calendar</a>
          </div>`
  };

  // Execute in background
  transporter.sendMail(mailOptions)
    .then(() => console.log(`📧 Email success to ${userEmail}`))
    .catch((err) => console.log(`📧 Email skip: ${err.message}`));
};

// --- 3. STARTUP & ROUTES ---
async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ CLOUD DB ACTIVE");
    app.get("/", (req, res) => res.send("API ACTIVE ✅"));
    app.listen(process.env.PORT || 5000, "0.0.0.0", () => console.log("🚀 Server Ready"));
  } catch (error) { console.error(error); }
}
main();

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection("users").insertOne({ name, email, password: hashedPassword, themeColor: 'indigo', avatarSeed: 'Felix' });
  const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET);
  res.json({ token, user: { name, email, themeColor: 'indigo', avatarSeed: 'Felix' } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.collection("users").findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).send("Invalid");
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { name: user.name, email: user.email, themeColor: user.themeColor, avatarSeed: user.avatarSeed } });
});

app.put("/api/auth/update-profile", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  await db.collection("users").updateOne({ _id: new ObjectId(decoded.id) }, { $set: req.body });
  res.json({ msg: "Synced" });
});

app.get("/api/tasks", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const tasks = await db.collection("tasks").find({ userId: new ObjectId(decoded.id) }).toArray();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
  const newTask = { ...req.body, userId: new ObjectId(decoded.id), createdAt: new Date() };
  await db.collection("tasks").insertOne(newTask);
  res.json(newTask); // Immediate response
  if (user) sendTaskEmail(user.email, user.name, newTask); // Background dispatch
});

app.delete("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ msg: "Deleted" });
});

app.put("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } });
  res.json({ msg: "Updated" });
});
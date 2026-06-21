import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "StudentTaskDB";
let db;

// --- GMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const sendTaskEmail = async (toEmail, senderName, task) => {
  const gCalDate = task.dueDate.replace(/-/g, '') + "T090000Z";
  const gLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${gCalDate}/${gCalDate}&details=${encodeURIComponent(task.description || '')}`;
  
  const mailOptions = {
    from: `"TaskPro" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🚀 TaskPro Assignment Node: ${task.title}`,
    html: `<div style="font-family:sans-serif;padding:30px;border-radius:25px;border:1px solid #6366f1;max-width:550px;background:#fcfcfc;">
            <h2 style="color:#6366f1;margin-bottom:20px;">Task Deployed!</h2>
            <p>A new actionable node has been assigned by <b>${senderName}</b>.</p>
            <div style="background:#f1f5f9;padding:20px;border-radius:15px;margin:20px 0;border-left:8px solid #6366f1;">
              <p><b>Objective:</b> ${task.title}</p>
              <p><b>Urgency:</b> ${task.priority}</p>
            </div>
            <a href="${gLink}" style="background:#6366f1;color:white;padding:12px 25px;text-decoration:none;border-radius:12px;font-weight:bold;display:inline-block;">Add to Google Calendar</a>
            <p style="margin-top:30px;font-size:10px;color:#94a3b8;text-align:center;">TaskPro Ecosystem • Developed by Yesaswi</p>
          </div>`
  };
  transporter.sendMail(mailOptions).catch(e => console.log("Email Error Skip"));
};

async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ CLOUD NODE ACTIVE");
    app.listen(process.env.PORT || 5000, "0.0.0.0", () => console.log("🚀 Server Online"));
  } catch (error) { console.error(error); }
}
main();

// --- AUTH & PROFILE SYNC ---
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
  res.json({ msg: "Cloud Synced" });
});

// --- TASK HUB ---
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
  const newTask = { ...req.body, userId: new ObjectId(decoded.id), status: "To-Do", comments: [], createdAt: new Date() };
  await db.collection("tasks").insertOne(newTask);
  res.json(newTask);
  const recipient = req.body.assignedTo || user.email;
  sendTaskEmail(recipient, user.name, newTask);
});

app.put("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
  res.json({ msg: "Updated" });
});

app.post("/api/tasks/:id/comments", async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
  const comment = { text: req.body.text, userName: user.name, timestamp: new Date() };
  await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $push: { comments: comment } });
  res.json(comment);
});

app.delete("/api/tasks/:id", async (req, res) => {
  await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ msg: "Deleted" });
});
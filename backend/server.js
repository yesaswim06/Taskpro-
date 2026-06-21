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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const sendTaskEmail = async (toEmail, senderName, task) => {
  const gLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`;
  const mailOptions = {
    from: `"TaskPro Manager" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🚀 TaskPro: New Node assigned to you by ${senderName}`,
    html: `<div style="font-family:sans-serif;padding:20px;border-radius:20px;border:1px solid #6366f1;">
            <h2>Action Required!</h2>
            <p><b>${senderName}</b> has delegated a new task node to you.</p>
            <p>Objective: <b>${task.title}</b></p>
            <p>Priority: ${task.priority}</p>
            <a href="${gLink}" style="background:#6366f1;color:white;padding:12px 25px;text-decoration:none;border-radius:10px;display:inline-block;">Add to Calendar</a>
          </div>`
  };
  transporter.sendMail(mailOptions).catch(e => console.log("Mail Fail"));
};

async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    app.listen(process.env.PORT || 5000, "0.0.0.0", () => console.log("🚀 Server Ready"));
  } catch (error) { console.error(error); }
}
main();

// AUTH ROUTES
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

// --- PERMANENT PROFILE SYNC ROUTE ---
app.put("/api/auth/update-profile", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, themeColor, avatarSeed } = req.body;
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { name, themeColor, avatarSeed } }
    );
    res.json({ msg: "Profile synced to Cloud Atlas" });
  } catch (err) {
    res.status(500).json({ msg: "Cloud sync failed" });
  }
});

// TASK ROUTES
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
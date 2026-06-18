import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

// --- CRITICAL: CORS MUST BE FIRST ---
// This open configuration allows Vercel, Netlify, and Localhost to work 100%
app.use(cors()); 
app.use(express.json());

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "StudentTaskDB";
let db;

// --- EMAIL ENGINE ---
// --- HARDENED CLOUD-OPTIMIZED EMAIL ENGINE ---
const transporter = nodemailer.createTransport({
  pool: true,                // Use pooled connection to avoid repeat handshakes
  host: "smtp.gmail.com",
  port: 465,                 // Port 465 (SSL) is usually more stable on Railway
  secure: true,              // True for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Bypasses SSL certificate issues in cloud containers
  },
  connectionTimeout: 15000,   // Wait 15 seconds before timing out
});

// --- ADD THIS LOG TO YOUR main() FUNCTION TO DEBUG ---
async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ CLOUD DB CONNECTED");

    // TEST EMAIL CONNECTION ON STARTUP
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ EMAIL SERVICE ERROR:", error.message);
      } else {
        console.log("✅ EMAIL SERVER IS READY TO DISPATCH");
      }
    });

    app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log("🚀 Server spinning on Railway");
    });
  } catch (error) { console.error("❌ DB ERROR:", error); }
}

const sendTaskEmail = async (userEmail, userName, task) => {
  const gCalTitle = encodeURIComponent(task.title);
  const gCalDate = task.dueDate.replace(/-/g, '') + "T090000Z";
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${gCalTitle}&dates=${gCalDate}/${gCalDate}`;

  const mailOptions = {
    from: `"TaskPro Support" <${process.env.EMAIL_USER}>`,
    to: userEmail, // Sends to the student who registered
    subject: `📌 New TaskPro Assignment: ${task.title}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #6366f1; border-radius: 15px;">
        <h2 style="color: #6366f1;">Hello ${userName}!</h2>
        <p>A new project has been added to your dashboard.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Deadline:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
        <br/>
        <a href="${calendarUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Add to Google Calendar
        </a>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ NODEMAILER ERROR:", err.message);
    // This will now show up in your Railway 'Deploy Logs'
  }
};

// --- DB CONNECTION & START ---
async function main() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ CLOUD DB CONNECTED");
    
    // Health Check
    app.get("/", (req, res) => res.send("TaskPro API is Live! ✅"));

    app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log("🚀 Server spinning on Railway");
    });
  } catch (error) { console.error("❌ DB ERROR:", error); }
}
main();

// --- ROUTES ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({ 
      name, email, password: hashedPassword, themeColor: 'indigo', avatarSeed: 'Felix'
    });
    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET);
    res.json({ token, user: { name, email, themeColor: 'indigo', avatarSeed: 'Felix' } });
  } catch (err) { res.status(500).json({ msg: "Registration Failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email, themeColor: user.themeColor || 'indigo', avatarSeed: user.avatarSeed || 'Felix' } });
  } catch (err) { res.status(500).json({ msg: "Login Failed" }); }
});

app.put("/api/auth/update-profile", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, themeColor, avatarSeed } = req.body;
    await db.collection("users").updateOne({ _id: new ObjectId(decoded.id) }, { $set: { name, themeColor, avatarSeed } });
    res.json({ msg: "Synced" });
  } catch (err) { res.status(500).send("Update error"); }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tasks = await db.collection("tasks").find({ userId: new ObjectId(decoded.id) }).toArray();
    res.json(tasks);
  } catch (err) { res.status(401).send("Denied"); }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    const newTask = { ...req.body, userId: new ObjectId(decoded.id), createdAt: new Date() };
    const result = await db.collection("tasks").insertOne(newTask);
    if (user) sendTaskEmail(user.email, user.name, { ...newTask });
    res.json({ ...newTask, _id: result.insertedId });
  } catch (err) { res.status(500).send("Task Error"); }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ msg: "Deleted" });
  } catch (err) { res.status(500).send("Delete error"); }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    await db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: req.body.status } });
    res.json({ msg: "Updated" });
  } catch (err) { res.status(500).send("Update error"); }
});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Path to your User model
require('dotenv').config();

const createFirstUser = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if user exists
    const existingUser = await User.findOne({ email: "student@intern.com" });
    if (existingUser) {
        console.log("User already exists!");
        process.exit();
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const newUser = new User({
        name: "Yesaswi",
        email: "student@intern.com",
        password: hashedPassword,
        role: "student"
    });

    await newUser.save();
    console.log("✅ Credentials Created Successfully!");
    console.log("Email: student@intern.com");
    console.log("Password: admin123");
    process.exit();
};

createFirstUser();
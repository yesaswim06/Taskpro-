const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRATION ROUTE
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to Database
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Create Token so they log in immediately after registering
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        // Change this line in both Register and Login routes:
const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, // Make sure this matches the .env file
    { expiresIn: '7d' }
);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
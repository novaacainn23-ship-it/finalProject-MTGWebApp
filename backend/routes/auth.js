const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Error: JWT_SECRET is not defined in .env");
  process.exit(1);
}

// Helper: sign a JWT for a user
function signUserToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin || false
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();

    const token = signUserToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = signUserToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Current user (used by frontend to get username/isAdmin/collection)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user comes from the token payload set by authenticateToken
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.username,
      isAdmin: user.isAdmin || false,
      collection: user.collection || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;

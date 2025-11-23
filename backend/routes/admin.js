const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");
const adminOnly = require("../middleware/adminOnly");

// Get all users
router.get("/users", adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});git 

// Delete a user
router.delete("/user/:id", adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Promote a user to admin
router.post('/promote/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin demoting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot modify your own admin status" });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: "User promoted to admin", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to promote user" });
  }
});


module.exports = router;

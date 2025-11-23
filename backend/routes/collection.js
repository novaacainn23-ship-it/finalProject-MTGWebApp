const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Get user's collection
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.collection || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch collection" });
  }
});

// Add card to collection
router.post('/add', authenticateToken, async (req, res) => {
  const { cardId, name, imageUrl } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.collection) user.collection = [];
    if (!user.collection.find(c => c.cardId === cardId)) {
      user.collection.push({ cardId, name, imageUrl });
      await user.save();
    }
    res.json(user.collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add card" });
  }
});

// Remove card from collection
router.post('/remove', authenticateToken, async (req, res) => {
  const { cardId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.collection) user.collection = [];
    user.collection = user.collection.filter(c => c.cardId !== cardId);
    await user.save();
    res.json(user.collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove card" });
  }
});

module.exports = router;

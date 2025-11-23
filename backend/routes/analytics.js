const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const adminOnly = require("../middleware/adminOnly");
const User = require("../models/User");

router.get("/", authenticateToken, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const users = await User.find({});
    let totalCards = 0;
    const cardFrequency = {};
    const cardsPerUser = [];

    // Gather stats
    users.forEach(user => {
      const count = user.collection.length;
      cardsPerUser.push({
        username: user.username,
        count
      });

      user.collection.forEach(card => {
        totalCards++;
        cardFrequency[card.name] =
          (cardFrequency[card.name] || 0) + 1;
      });
    });

    // Determine most common card
    const mostCommonCard =
      Object.entries(cardFrequency).sort((a, b) => b[1] - a[1])[0] ||
      ["None", 0];

    res.json({
      totalUsers,
      totalCards,
      mostCommonCard: {
        name: mostCommonCard[0],
        count: mostCommonCard[1]
      },
      cardsPerUser,
      cardFrequency
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

module.exports = router;

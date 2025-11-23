const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'No search term' });

  try {
    const response = await axios.get(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(name)}`);
    const cards = response.data.data.map(card => ({
      id: card.id,
      name: card.name,
      type: card.type_line,
      image_uris: card.image_uris || null
    }));
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cards', error: err.message });
  }
});

module.exports = router;

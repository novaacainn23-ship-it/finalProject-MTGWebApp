const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  collection: [
    {
      cardId: String,
      name: String,
      imageUrl: String
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);

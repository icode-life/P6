const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false },
  mainPepper: { type: String, required: true },
  heat: { type: Number, required: true},
  likes: { type: Number, required: false },
  dislikes: {type: Number, required: false},
  likesUserIds: {type: String, required: false},
  dislikesUserIds: {type: String, required: false}
});

module.exports = mongoose.model('Sauce', sauceSchema);
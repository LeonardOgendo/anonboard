const mongoose = require('mongoose');
const { Schema } = mongoose;

const replySchema = new Schema({
  text: String,
  delete_password: String,
  created_on: Date,
  reported: { type: Boolean, default: false }
}, { _id: true });

const threadSchema = new Schema({
  board: String,
  text: String,
  delete_password: String,
  created_on: Date,
  bumped_on: Date,
  reported: { type: Boolean, default: false },
  replies: [replySchema]
});

module.exports = mongoose.model('Thread', threadSchema);

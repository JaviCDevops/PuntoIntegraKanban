const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  
  columns: [{
    id: String,
    title: String,
    color: String
  }],

  rows: [{
    id: String,
    title: String,
    color: String
  }],

  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
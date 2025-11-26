const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  status: { type: String, required: true },
  rowId: { type: String, required: true }, 
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  createdAt: { type: Date, default: Date.now },

  checklist: [{
    text: String,
    done: { type: Boolean, default: false }
  }],

    createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('Task', TaskSchema);
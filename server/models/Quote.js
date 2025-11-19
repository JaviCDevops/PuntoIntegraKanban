const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  description: String, 
  amount: Number,      
  status: { 
    type: String, 
    enum: ['borrador', 'aprobada'], 
    default: 'borrador' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', QuoteSchema);
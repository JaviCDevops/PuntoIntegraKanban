const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  area: String,
  clientRut: String,
  clientGiro: String,
  clientAddress: String,
  clientContact: String,
  clientEmail: String,
  clientPhone: String,           
  clientName: String,     
  description: String,    
  netoUF: Number,         
  fechaEnvio: Date,
  projectCode: String,

  payments: [{
    percentage: Number,      
    amount: Number,          
    invoiceNumber: String,   
    status: { 
      type: String, 
      enum: ['PENDIENTE', 'FACTURADO', 'PAGADO'], 
      default: 'PENDIENTE'
    }
  }],

  status: { 
    type: String, 
    enum: [
      '0-PENDIENTE DE ENVIO', 
      '1-ESPERA RESPUESTA CLIENTE', 
      '2-ADJUDICADO', 
      '3-PERDIDO'
    ], 
    default: '0-PENDIENTE DE ENVIO' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', QuoteSchema);
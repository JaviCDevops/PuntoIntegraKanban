const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  area: String,
  description: String,
  
  clientName: String, 
  clientRut: String,
  clientGiro: String,
  clientAddress: String,
  clientContact: String,
  clientEmail: String,
  clientPhone: String,

  netoUF: Number,
  netoCLP: Number, 
  
  projectCode: String,
  purchaseOrder: String,
  
  createdAt: { type: Date, default: Date.now }, 
  fechaEnvio: Date,      
  startDate: Date,       
  deadline: Date,        
  
  reminderDate: Date,    
  expirationDate: Date,  
  
  payments: [{
    percentage: Number,
    amount: Number,
    invoiceNumber: String,
    date: Date,              
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
  }
});

module.exports = mongoose.model('Quote', QuoteSchema);
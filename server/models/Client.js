const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  rut: { type: String, required: true, unique: true }, // RUT único
  razonSocial: { type: String, required: true },
  giro: String,
  direccion: String,
  contactoNombre: String,
  email: String,
  telefono: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', ClientSchema);
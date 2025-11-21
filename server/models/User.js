const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'user'], // Simplificamos a Admin o Usuario normal
    default: 'user' 
  },
  // --- NUEVO: Lista de permisos específicos ---
  permissions: {
    type: [String], 
    default: [] // Ej: ['access_quotes', 'access_kanban']
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
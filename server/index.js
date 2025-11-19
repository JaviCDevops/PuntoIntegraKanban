// server/index.js
const Quote = require('./models/Quote');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task'); // Importamos el modelo
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Permite que React (puerto 5173) hable con Node (puerto 5000)
app.use(express.json()); // Permite leer JSON en el body de las peticiones

// Conexión a MongoDB (Asegúrate de tener tu string de conexión)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mistareas')
  .then(() => console.log('DB Conectada'))
  .catch(err => console.error(err));

// --- RUTAS ---

// 1. Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// 2. Crear una tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Actualizar estado
app.put('/api/tasks/:id', async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedTask);
});

// --- RUTAS DE COTIZACIONES ---

// 1. Obtener cotizaciones
app.get('/api/quotes', async (req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.json(quotes);
});

// 2. Crear nueva cotización
app.post('/api/quotes', async (req, res) => {
  try {
    const newQuote = new Quote(req.body);
    const savedQuote = await newQuote.save();
    res.status(201).json(savedQuote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. APROBAR Cotización (¡Aquí ocurre la conexión con el Kanban!)
app.put('/api/quotes/approve/:id', async (req, res) => {
  try {
    // A. Buscamos la cotización
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Cotización no encontrada' });

    // B. Cambiamos estado a aprobada
    quote.status = 'aprobada';
    await quote.save();

    // C. MAGIA: Creamos automáticamente la Tarea en el Kanban
    const newTask = new Task({
      title: `${quote.clientName}: ${quote.description}`, // Ej: "Juan Perez: Cambio de aceite"
      status: 'pendiente'
    });
    await newTask.save();

    res.json({ message: 'Cotización aprobada y tarea creada', quote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Eliminar Cotización
app.delete('/api/quotes/:id', async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cotización eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Iniciar servidor
app.listen(5000, () => console.log('Servidor corriendo en puerto 5000'));
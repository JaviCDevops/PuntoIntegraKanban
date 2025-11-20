const Quote = require('./models/Quote');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mistareas')
  .then(() => console.log('DB Conectada'))
  .catch(err => console.error(err));

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

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

app.put('/api/tasks/:id', async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedTask);
});

app.get('/api/quotes', async (req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.json(quotes);
});

app.post('/api/quotes', async (req, res) => {
  try {
    const newQuote = new Quote(req.body);
    const savedQuote = await newQuote.save();
    res.status(201).json(savedQuote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- ACTUALIZAR COTIZACIÓN (ESTADO, PXX, KANBAN Y PAGOS) ---
app.put('/api/quotes/:id', async (req, res) => {
  try {
    // 1. Recibimos "status" Y TAMBIÉN "payments" del cuerpo de la petición
    const { status, payments } = req.body; 
    
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'No encontrada' });

    // --- LÓGICA DE ESTADOS Y PROYECTOS (PXX) ---
    
    // Si hay cambio de estatus a "ESPERA", guardamos fecha
    if (status && status === '1-ESPERA RESPUESTA CLIENTE' && quote.status !== '1-ESPERA RESPUESTA CLIENTE') {
      quote.fechaEnvio = new Date();
    }

    // Si hay cambio a "ADJUDICADO" y no tiene código, generamos PXX y Tarea
    if (status && status === '2-ADJUDICADO' && !quote.projectCode) {
      const count = await Quote.countDocuments({ projectCode: { $exists: true } });
      const nextNum = count + 1;
      const formattedNum = nextNum < 10 ? `0${nextNum}` : nextNum;
      quote.projectCode = `P${formattedNum}`;

      // Crear Tarea Kanban
      const Task = require('./models/Task');
      const newTask = new Task({
        title: `${quote.projectCode} - ${quote.clientName}: ${quote.description}`,
        status: 'pendiente'
      });
      await newTask.save();
    }

    // Actualizamos el status si viene en la petición
    if (status) quote.status = status;

    // --- LÓGICA DE PAGOS (LA PARTE QUE FALTABA) ---
    if (payments) {
      quote.payments = payments; // <--- ESTO FALTABA: Guardar el array de pagos
    }
    // ---------------------------------------------

    const updatedQuote = await quote.save();
    res.json(updatedQuote);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cotización eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => console.log('Servidor corriendo en puerto 5000'));
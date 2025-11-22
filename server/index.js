const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- IMPORTAR TODOS LOS MODELOS ---
const User = require('./models/User');
const Task = require('./models/Task');
const Quote = require('./models/Quote');
const Client = require('./models/Client');
const Board = require('./models/Board');

const app = express();
const { ObjectId } = require('mongoose').Types;

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_cambiar_en_prod";
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mistareas')
  .then(() => console.log('DB Conectada'))
  .catch(err => console.error('Error DB:', err));

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  try {
    const actualToken = token.split(' ')[1]; 
    const decoded = jwt.verify(actualToken, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) { return res.status(401).json({ message: 'Unauthorized' }); }
};

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, permissions: user.permissions }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, permissions: user.permissions } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/auth/register-first-admin', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword, role: 'admin' });
    await newUser.save();
    res.json({ message: 'Admin creado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ADMIN USERS (CRUD COMPLETO) ---
app.post('/api/admin/create-user', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'Usuario creado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/users', verifyToken, async (req, res) => {
  try { const users = await User.find({}, '-password').sort({ createdAt: -1 }); res.json(users); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/users/:id', verifyToken, async (req, res) => {
  try { const user = await User.findById(req.params.id, '-password'); res.json(user); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/users/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });
  try {
    const updateData = { ...req.body };
    if (updateData.password) updateData.password = await bcrypt.hash(updateData.password, 10);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// NUEVA RUTA: ELIMINAR USUARIO
app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });
  try {
    // Seguridad: No permitir que el admin se borre a sí mismo
    if (req.user.id === req.params.id) {
        return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- CLIENTS ---
app.get('/api/clients', verifyToken, async (req, res) => {
  try { const clients = await Client.find().sort({ razonSocial: 1 }); res.json(clients); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/clients', verifyToken, async (req, res) => {
  try { const newClient = new Client(req.body); await newClient.save(); res.json(newClient); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/clients/:id', verifyToken, async (req, res) => {
  try { res.json(await Client.findById(req.params.id)); } catch (e) { res.status(500).send(e); }
});
app.put('/api/clients/:id', verifyToken, async (req, res) => {
  try { res.json(await Client.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(500).send(e); }
});
app.delete('/api/clients/:id', verifyToken, async (req, res) => {
  try { await Client.findByIdAndDelete(req.params.id); res.json({msg: "ok"}); } catch (e) { res.status(500).send(e); }
});

// --- BOARDS ---
app.get('/api/boards', verifyToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { members: req.user.id };
    const boards = await Board.find(query).populate('members', 'username');
    res.json(boards);
  } catch (error) { res.status(500).json({error: error.message}); }
});
app.post('/api/boards', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message: 'Solo admin'});
  try { const newBoard = new Board(req.body); await newBoard.save(); res.json(newBoard); } 
  catch (error) { res.status(500).json({error: error.message}); }
});
app.get('/api/boards/:id', verifyToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({message: 'No encontrado'});
    res.json(board);
  } catch (error) { res.status(500).json({error: error.message}); }
});
app.put('/api/boards/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message: 'Solo admin'});
  try { res.json(await Board.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(500).send(e); }
});
app.delete('/api/boards/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message: 'Solo admin'});
  try { 
    await Task.deleteMany({ boardId: req.params.id });
    await Board.findByIdAndDelete(req.params.id);
    res.json({message: "Deleted"}); 
  } catch (e) { res.status(500).send(e); }
});

// --- TASKS ---
app.get('/api/tasks/board/:boardId', verifyToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    if (!boardId || boardId === 'undefined' || !ObjectId.isValid(boardId)) return res.status(400).json({msg: 'ID invalido'});
    const tasks = await Task.find({ boardId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) { res.status(500).json({error: error.message}); }
});
app.post('/api/tasks', verifyToken, async (req, res) => {
  try { 
    const newTask = new Task(req.body); 
    await newTask.save(); 
    res.json(newTask); 
  } catch (e) { 
    console.error("Error creando tarea:", e.message);
    res.status(400).json({message: e.message}); 
  }
});
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try { await Task.findByIdAndUpdate(req.params.id, req.body); res.json({msg:"ok"}); } catch (e) { res.status(500).send(e); }
});
app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({msg:"ok"}); } catch (e) { res.status(500).send(e); }
});

// --- QUOTES ---
app.get('/api/quotes', verifyToken, async (req, res) => {
  try { const quotes = await Quote.find().sort({ createdAt: -1 }); res.json(quotes); } catch (e) { res.status(500).json({error: e.message}); }
});
app.post('/api/quotes', verifyToken, async (req, res) => { 
  try {
    const data = req.body;
    if (!data.status) data.status = '0-PENDIENTE DE ENVIO';
    const newQuote = new Quote(data);
    await newQuote.save();
    res.json(newQuote);
  } catch(e) { res.status(400).json({message: e.message}); }
});

app.put('/api/quotes/:id', verifyToken, async (req, res) => {
  try {
    const { status, payments } = req.body; 
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'No encontrada' });

    if (status) {
      if (status === '1-ESPERA RESPUESTA CLIENTE' && quote.status !== '1-ESPERA RESPUESTA CLIENTE') {
        quote.fechaEnvio = new Date();
      }
      if (status === '2-ADJUDICADO' && !quote.projectCode) {
        const count = await Quote.countDocuments({ projectCode: { $exists: true } });
        const nextNum = count + 1;
        const formattedNum = nextNum < 10 ? `0${nextNum}` : nextNum;
        quote.projectCode = `P${formattedNum}`;
        try {
          let defaultBoard = await Board.findOne();
          if (!defaultBoard) {
             defaultBoard = new Board({ 
               title: "Tablero General", 
               description: "Tablero creado automáticamente",
               columns: [
                 { id: 'pendiente', title: 'Pendiente', color: '#ff7675' },
                 { id: 'en_progreso', title: 'En Proceso', color: '#fdcb6e' },
                 { id: 'completada', title: 'Terminado', color: '#55efc4' }
               ],
               rows: [{ id: 'general', title: 'General', color: '#dfe6e9' }]
             });
             await defaultBoard.save();
          }
          const firstColId = defaultBoard.columns?.[0]?.id || 'pendiente';
          const firstRowId = defaultBoard.rows?.[0]?.id || 'def-row';
          const newTask = new Task({
            title: `${quote.projectCode} - ${quote.clientName}: ${quote.description}`,
            status: firstColId,
            rowId: firstRowId,
            boardId: defaultBoard._id
          });
          await newTask.save();
        } catch (taskError) { console.error("Error al crear tarea automática:", taskError.message); }
      }
      quote.status = status;
    }
    if (payments) quote.payments = payments;
    const updatedQuote = await quote.save();
    res.json(updatedQuote);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/quotes/:id', verifyToken, async (req, res) => {
  try { await Quote.findByIdAndDelete(req.params.id); res.json({msg:"ok"}); } catch (e) { res.status(500).send(e); }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
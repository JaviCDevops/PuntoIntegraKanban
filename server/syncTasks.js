const mongoose = require('mongoose');
const Quote = require('./models/Quote');
const Task = require('./models/Task');
const Board = require('./models/Board');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB. Iniciando sincronización...');

    let targetBoard = await Board.findOne({ title: "OPERACIONES" });
    
    if (!targetBoard) {
      targetBoard = await Board.findOne(); 
      if (!targetBoard) {
         console.log("⚠️ No se encontró ningún tablero. Creando 'OPERACIONES'...");
         targetBoard = new Board({ 
           title: "OPERACIONES", 
           description: "Tablero central generado automáticamente",
           columns: [
             { id: 'en_proceso', title: 'En Proceso', color: '#ff9f43' },
             { id: 'ejecucion', title: 'Ejecución', color: '#54a0ff' },
             { id: 'terminado', title: 'Terminado', color: '#1dd1a1' }
           ],
           rows: [{ id: 'general', title: 'General', color: '#dfe6e9' }],
           members: [] 
         });
         await targetBoard.save();
      }
    }
    
    console.log(`📋 Usando tablero destino: "${targetBoard.title}"`);

    const firstColId = targetBoard.columns[0]?.id || 'pendiente';
    const firstRowId = targetBoard.rows[0]?.id || 'def-row';

    const approvedQuotes = await Quote.find({ status: '2-ADJUDICADO' });
    console.log(`🔍 Analizando ${approvedQuotes.length} proyectos adjudicados...`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const quote of approvedQuotes) {
      if (!quote.projectCode) continue;

      const existingTask = await Task.findOne({ 
        title: { $regex: `^${quote.projectCode}` },
        boardId: targetBoard._id
      });

      if (!existingTask) {
        const newTask = new Task({
          title: `${quote.projectCode} - ${quote.clientName}: ${quote.description || 'Sin detalle'}`,
          description: quote.description,
          status: firstColId, 
          rowId: firstRowId,  
          boardId: targetBoard._id,
          checklist: []
        });
        
        await newTask.save();
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('-----------------------------------');
    console.log(`✅ Sincronización terminada.`);
    console.log(`✨ Tareas nuevas creadas: ${createdCount}`);
    console.log(`⏭️  Tareas ya existentes (saltadas): ${skippedCount}`);
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
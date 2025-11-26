const mongoose = require('mongoose');
const Client = require('./models/Client');
const Quote = require('./models/Quote'); 
require('dotenv').config();

const normalizeRut = (rut) => {
  if (!rut) return '';
  let clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  return `${body}-${dv}`;
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB. Iniciando fusión inteligente...');
    
    const clients = await Client.find({});
    console.log(`🔍 Analizando ${clients.length} clientes...`);

    const processedRuts = new Set();
    let mergedCount = 0;
    let cleanedCount = 0;
    let quotesUpdated = 0;

    for (const client of clients) {
      const originalRut = client.rut;
      const cleanRut = normalizeRut(originalRut);

      if (originalRut !== cleanRut) {
        
        const officialClient = await Client.findOne({ rut: cleanRut });

        if (officialClient && officialClient._id.toString() !== client._id.toString()) {
          console.log(`🔄 Fusionando: ${originalRut} (Duplicado) -> ${cleanRut} (Oficial)`);

          const quotesToFix = await Quote.find({ clientRut: originalRut });
          
          if (quotesToFix.length > 0) {
             console.log(`   ↳ Moviendo ${quotesToFix.length} proyectos/cotizaciones...`);
             await Quote.updateMany(
               { clientRut: originalRut }, 
               { $set: { clientRut: cleanRut, clientName: officialClient.razonSocial } }
             );
             quotesUpdated += quotesToFix.length;
          }

          await Client.findByIdAndDelete(client._id);
          mergedCount++;
          continue; 

        } else {
          if (processedRuts.has(cleanRut)) {
             console.log(`🗑️ Borrando duplicado en memoria: ${originalRut}`);
             await Client.findByIdAndDelete(client._id);
             mergedCount++;
             continue;
          }

          console.log(`✏️ Corrigiendo formato: ${originalRut} -> ${cleanRut}`);
          
          const quotesToUpdate = await Quote.updateMany(
            { clientRut: originalRut }, 
            { $set: { clientRut: cleanRut } }
          );
          if (quotesToUpdate.modifiedCount > 0) {
            console.log(`   ↳ Actualizados ${quotesToUpdate.modifiedCount} proyectos vinculados.`);
            quotesUpdated += quotesToUpdate.modifiedCount;
          }

          client.rut = cleanRut;
          try {
            await client.save();
            cleanedCount++;
            processedRuts.add(cleanRut);
          } catch (e) {
             console.log(`⚠️ Error guardando ${cleanRut}, posible conflicto. Eliminando.`);
             await Client.findByIdAndDelete(client._id);
          }
        }
      } else {
        if (processedRuts.has(cleanRut)) {
             console.log(`🗑️ Borrando clon exacto: ${cleanRut}`);
             await Quote.updateMany({ clientRut: cleanRut }, { $set: { clientRut: cleanRut } }); 
             await Client.findByIdAndDelete(client._id);
             mergedCount++;
        } else {
             processedRuts.add(cleanRut);
        }
      }
    }

    console.log('-----------------------------------');
    console.log(`✅ Fusión terminada.`);
    console.log(`✏️ Clientes normalizados: ${cleanedCount}`);
    console.log(`🔀 Clientes fusionados/borrados: ${mergedCount}`);
    console.log(`📂 Proyectos/Cotizaciones re-vinculados: ${quotesUpdated}`);
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
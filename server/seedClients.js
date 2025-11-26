const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Client = require('./models/Client'); 
require('dotenv').config();

const clientesParaInsertar = [];

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB. Leyendo archivo CSV...');
    
    fs.createReadStream('cliente.csv')
      .pipe(csv())
      .on('data', (row) => {

        const rutFull = `${row.cliente_rut}-${row.cliente_rutdv}`;


        const nuevoCliente = {
          rut: rutFull,
          razonSocial: row.cliente_razon_social?.trim(),
          giro: row.cliente_giro?.trim(),
          direccion: row.cliente_direccion?.trim(),
          contactoNombre: row.cliente_contacto_nombre?.trim(),
          email: row.cliente_contacto_email?.trim(),
          telefono: row.cliente_contacto_telefono?.trim()
        };

        if (row.cliente_rut && row.cliente_razon_social) {
            clientesParaInsertar.push(nuevoCliente);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📂 Se encontraron ${clientesParaInsertar.length} clientes en el archivo.`);

          const resultado = await Client.insertMany(clientesParaInsertar, { ordered: false });
          
          console.log(`🚀 ¡Éxito! Se cargaron ${resultado.length} clientes nuevos.`);
          process.exit();

        } catch (error) {
          if (error.code === 11000 || error.writeErrors) {
             console.log(`⚠️ Proceso terminado. Algunos clientes ya existían y se omitieron (Duplicados).`);
             console.log(`✅ Clientes nuevos insertados correctamente: ${error.result?.nInserted || 'Varios'}`);
          } else {
             console.error('❌ Error grave:', error);
          }
          process.exit();
        }
      });
  })
  .catch(err => {
      console.error('❌ Error de conexión a Mongo:', err);
      process.exit(1);
  });
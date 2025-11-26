const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Quote = require('./models/Quote');
const Client = require('./models/Client'); 
require('dotenv').config();

const AREA_MAP = {
  '1': 'Ingeniería',
  '2': 'Servicios',
  '3': 'Ventas',
  '4': 'Gerencia'
};

const quotesParaInsertar = [];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB.');
    
    console.log('🧹 Borrando presupuestos antiguos...');
    await Quote.deleteMany({}); 
    console.log('✨ Base de datos de presupuestos limpia.');

    console.log('🔄 Indexando clientes...');
    const clients = await Client.find({});
    const clientMap = {};
    clients.forEach(c => {
      const rutLimpio = c.rut.replace(/\./g, '').split('-')[0];
      clientMap[rutLimpio] = c.razonSocial;
    });

    console.log('🚀 Migrando datos con corrección de estados...');

    fs.createReadStream('presupuesto.csv') 
      .pipe(csv())
      .on('data', (row) => {
        const rutCsv = row.cliente_rut; 
        const clientName = clientMap[rutCsv] || `Cliente RUT ${rutCsv}`;
        const description = row.presup_detalle?.trim() || 'Presupuesto importado';
        const netoUF = parseFloat(row.presup_neto_uf?.replace(',', '.')) || 0;
        const netoCLP = parseFloat(row.presup_neto_clp?.replace(',', '.')) || 0; 

        let status = '0-PENDIENTE DE ENVIO';

        const isAdjudicada = row.presup_adjudicada == '1';
        const isEnviada = row.presup_enviado == '1';
        const statusCode = row.estatus_codigo;

        if (isAdjudicada) {
            status = '2-ADJUDICADO';
        } else if (statusCode == '4' || statusCode == '5') { 
            status = '3-PERDIDO';
        } else if (isEnviada) {
            status = '1-ESPERA RESPUESTA CLIENTE';
        }

        const area = AREA_MAP[row.area_codigo] || 'General';
        
        let fecha = new Date(row.presup_fecha_creacion);
        if (isNaN(fecha.getTime())) fecha = new Date();
        
        let fechaEnvio = undefined;
        if (row.presup_fecha_envio && row.presup_fecha_envio !== '0000-00-00') {
            fechaEnvio = new Date(row.presup_fecha_envio);
        } else if (status !== '0-PENDIENTE DE ENVIO') {
            fechaEnvio = fecha;
        }

        let projectCode = undefined;
        if (row.presup_numero) {
          const rawNum = row.presup_numero.toString();
          if (rawNum.length >= 5) {
             const year = rawNum.substring(0, 4); 
             const seq = parseInt(rawNum.substring(4)); 
             const formattedSeq = seq < 10 ? `0${seq}` : seq;
             projectCode = `${year}_${formattedSeq}`; 
          } else {
             projectCode = row.presup_numero; 
          }
        }

        const nuevaCotizacion = {
          area, clientName, description, netoUF, netoCLP, 
          status, fechaEnvio, projectCode, createdAt: fecha,
          clientRut: rutCsv, payments: [] 
        };

        if (description) quotesParaInsertar.push(nuevaCotizacion);
      })
      .on('end', async () => {
        try {
          console.log(`📂 Insertando ${quotesParaInsertar.length} registros...`);
          await Quote.insertMany(quotesParaInsertar, { ordered: false });
          console.log(`✨ ¡Éxito! Migración completada.`);
          process.exit();
        } catch (error) { console.error('❌ Error:', error.message); process.exit(1); }
      });
  })
  .catch(err => { console.error('❌ Error conexión:', err); process.exit(1); });
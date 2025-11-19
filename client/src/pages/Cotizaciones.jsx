import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';              
import autoTable from 'jspdf-autotable'; 
import { API_URL } from '../config';

function Cotizaciones() {
  const [quotes, setQuotes] = useState([]);
  const [formData, setFormData] = useState({ clientName: '', description: '', amount: '' });

  const formatearDinero = (valor) => {
    if (!valor) return "0";
    return Number(valor).toLocaleString('es-CL'); 
  };

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    // CORRECCIÓN 1: Usar backticks (`), cambiar /tasks por /quotes
    const res = await axios.get(`${API_URL}/quotes`);
    setQuotes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // CORRECCIÓN 2: Agregar /quotes al final
    await axios.post(`${API_URL}/quotes`, formData);
    setFormData({ clientName: '', description: '', amount: '' }); 
    fetchQuotes();
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Al aprobar, se creará una tarea en el tablero. ¿Continuar?')) return;
    try {
      // CORRECCIÓN 3: La ruta correcta es /quotes/approve
      await axios.put(`${API_URL}/quotes/approve/${id}`);
      alert("¡Cotización Aprobada! Tarea enviada al Kanban.");
      fetchQuotes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cotización?")) return;

    try {
      // CORRECCIÓN 4: Agregar /quotes antes del ID
      await axios.delete(`${API_URL}/quotes/${id}`);
      setQuotes(quotes.filter(q => q._id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // ... La función generatePDF y el return están perfectos, no cambian ...
  const generatePDF = (quote) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("COTIZACIÓN", 14, 22);
    doc.setFontSize(10);
    doc.text("Mi Empresa de Servicios S.A.", 14, 30);
    doc.text("contacto@miempresa.com", 14, 35);
    doc.setFontSize(12);
    doc.text(`Cliente: ${quote.clientName}`, 14, 50);
    const fecha = new Date(quote.createdAt).toLocaleDateString();
    doc.text(`Fecha: ${fecha}`, 14, 56);
    autoTable(doc, {
      startY: 65,
      head: [['Descripción del Servicio', 'Precio']],
      body: [
        [quote.description, `$${formatearDinero(quote.amount)}`], 
      ],
      theme: 'grid',
      headStyles: { fillColor: [108, 92, 231] }, 
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total a Pagar: $${formatearDinero(quote.amount)}`, 14, finalY);
    doc.save(`Cotizacion_${quote.clientName}.pdf`);
  };

  return (
    <div className="cotizaciones-container">
      {/* ... Aquí envuelve la tabla en el div para responsive si no lo has hecho ... */}
      <div className="table-wrapper"> 
          <h2>Módulo de Cotizaciones</h2>
          <form onSubmit={handleSubmit} className="quote-form">
            <input 
              type="text" placeholder="Nombre Cliente" required
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
            />
            <input 
              type="text" placeholder="Descripción del servicio" required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <input 
              type="number" placeholder="Monto ($)" required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
            <button type="submit">Crear Cotización</button>
          </form>

          <table className="quote-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote._id}>
                  <td>{quote.clientName}</td>
                  <td>{quote.description}</td>
                  <td>${formatearDinero(quote.amount)}</td>
                  <td>
                    <span className={`badge ${quote.status}`}>{quote.status}</span>
                  </td>
                  <td>
                    {quote.status === 'borrador' && (
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(quote._id)}
                      >
                        Aprobar
                      </button>
                    )}

                    <button 
                      className="pdf-btn" 
                      onClick={() => generatePDF(quote)}
                      style={{ marginLeft: '10px' }} 
                      title="Descargar PDF">
                      📄 PDF
                    </button>
                    
                    {quote.status === 'aprobada' && <span>✅ Procesado</span>}

                    <button 
                        className="delete-quote-btn" 
                        onClick={() => handleDelete(quote._id)}
                        style={{ marginLeft: '10px' }}
                        title="Eliminar"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default Cotizaciones;
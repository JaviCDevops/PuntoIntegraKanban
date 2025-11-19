import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';               
import autoTable from 'jspdf-autotable'; 

function Cotizaciones() {
  const [quotes, setQuotes] = useState([]);
  const [formData, setFormData] = useState({ clientName: '', description: '', amount: '' });
  

  const API_URL = 'http://localhost:5000/api/quotes';

    const formatearDinero = (valor) => {
    if (!valor) return "0";
    return Number(valor).toLocaleString('es-CL'); 
  };

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    const res = await axios.get(API_URL);
    setQuotes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, formData);
    setFormData({ clientName: '', description: '', amount: '' }); // Limpiar form
    fetchQuotes();
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Al aprobar, se creará una tarea en el tablero. ¿Continuar?')) return;
    try {
      await axios.put(`${API_URL}/approve/${id}`);
      alert("¡Cotización Aprobada! Tarea enviada al Kanban.");
      fetchQuotes();
    } catch (error) {
      console.error(error);
    }

    
};

  const generatePDF = (quote) => {
    const doc = new jsPDF();

    // 1. Encabezado de la Empresa
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("COTIZACIÓN", 14, 22);
    
    doc.setFontSize(10);
    doc.text("Mi Empresa de Servicios S.A.", 14, 30);
    doc.text("contacto@miempresa.com", 14, 35);

    // 2. Datos del Cliente y Fecha
    doc.setFontSize(12);
    doc.text(`Cliente: ${quote.clientName}`, 14, 50);
    const fecha = new Date(quote.createdAt).toLocaleDateString();
    doc.text(`Fecha: ${fecha}`, 14, 56);

    // 3. La Tabla de Productos/Servicios
    autoTable(doc, {
      startY: 65,
      head: [['Descripción del Servicio', 'Precio']],
      body: [
        [quote.description, `$${formatearDinero(quote.amount)}`], // Aquí irían más filas si tuvieras más items
      ],
      theme: 'grid',
      headStyles: { fillColor: [108, 92, 231] }, // Color morado bonito
    });

    // 4. Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total a Pagar: $${formatearDinero(quote.amount)}`, 14, finalY);

    // 5. Descargar
    doc.save(`Cotizacion_${quote.clientName}.pdf`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cotización?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      // Actualizamos la lista visualmente
      setQuotes(quotes.filter(q => q._id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="cotizaciones-container">
      <h2>Módulo de Cotizaciones</h2>

      {/* Formulario de Creación */}
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

      {/* Tabla de Listado */}
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
                    Aprobar y Crear Tarea
                  </button>
                )}

                {/* --- NUEVO BOTÓN PDF --- */}
                  <button 
                    className="pdf-btn" 
                    onClick={() => generatePDF(quote)}
                    style={{ marginLeft: '10px' }} // Un poco de espacio
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
  );
}

export default Cotizaciones;
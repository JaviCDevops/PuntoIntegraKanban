import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';              
import autoTable from 'jspdf-autotable'; 
import { API_URL } from '../config';
import { FaEye, FaEyeSlash, FaFilePdf, FaTrash, FaPlus } from "react-icons/fa";

function Cotizaciones() {
  const [quotes, setQuotes] = useState([]);
  const [showCosts, setShowCosts] = useState(false); 

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(res.data);
    } catch (error) { console.error("Error cargando cotizaciones", error); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/quotes/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuotes(); 
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este presupuesto?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuotes();
    } catch (error) { console.error(error); }
  };

  const generatePDF = async (quote) => {
    const doc = new jsPDF();
    const neto = Number(quote.netoUF || 0);
    const iva = neto * 0.19;
    const total = neto + iva;
    const fNumPDF = (n) => Number(n).toFixed(2);

    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("PRESUPUESTO (UF)", 14, 22);
    doc.setFontSize(10);
    doc.text("Mi Empresa S.A.", 14, 30);
    doc.text(new Date().toLocaleDateString(), 180, 30); 
    
    doc.setFontSize(12);
    doc.text(`Cliente: ${quote.clientName}`, 14, 45);
    doc.text(`Area: ${quote.area}`, 14, 52);
    
    autoTable(doc, {
      startY: 60,
      head: [['Descripción / Detalle', 'Valor (UF)']],
      body: [[quote.description, `${fNumPDF(neto)} UF`]],
      theme: 'grid',
      headStyles: { fillColor: [9, 132, 227] },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Neto: ${fNumPDF(neto)} UF`, 140, finalY);
    doc.text(`IVA (19%): ${fNumPDF(iva)} UF`, 140, finalY + 6);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${fNumPDF(total)} UF`, 140, finalY + 14);

    finalY += 50; 
    if (finalY > 260) { doc.addPage(); finalY = 40; }

    const pageCenter = 105; 
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(pageCenter - 30, finalY, pageCenter + 30, finalY); 
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Firma Responsable / Empresa", pageCenter, finalY + 5, { align: 'center' });
    doc.text("Mi Empresa S.A.", pageCenter, finalY + 10, { align: 'center' });

    try {
      const img = new Image();
      img.src = '/LOGO_PI_FINAL.png'; 
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      doc.addImage(img, 'PNG', 85, finalY + 15, 40, 20); 
    } catch (error) { console.warn("No se pudo cargar el logo"); }

    doc.save(`Presupuesto_${quote.clientName}.pdf`);
  };

  const fNum = (num) => Number(num).toFixed(2);
  const fFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString() + ' ' + new Date(fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="cotizaciones-container">
      <div className="page-header">
        <h2>Listado de Presupuestos</h2>
        <div className="header-actions">
          <button onClick={() => setShowCosts(!showCosts)} className="icon-btn eye-btn" title={showCosts ? "Ocultar Valores" : "Mostrar Valores"}>
            {showCosts ? <FaEye /> : <FaEyeSlash />} 
          </button>
          <Link to="/cotizaciones/crear" className="new-quote-link">
            <button className="btn-new-quote"><FaPlus /> Nueva Cotización</button>
          </Link>
        </div>
      </div>

      <div className="table-wrapper">
          <table className="quote-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Cliente</th>
                <th>Detalle</th>
                <th>Neto (UF)</th>
                <th>IVA (UF)</th>
                <th>Total (UF)</th>
                <th>Fecha Envío</th>
                <th>Status Presupuesto</th>
                <th>Status Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => {
                const neto = Number(quote.netoUF || 0);
                const iva = neto * 0.19;
                const total = neto + iva;

                let payStatusLabel = 'PENDIENTE';
                let payStatusClass = 'pay-pending';

                if (quote.payments && quote.payments.length > 0) {
                  const totalCuotas = quote.payments.length;
                  const pagadas = quote.payments.filter(p => p.status === 'PAGADO').length;
                  const facturadas = quote.payments.filter(p => p.status === 'FACTURADO').length;

                  if (pagadas === totalCuotas) { payStatusLabel = 'COMPLETO'; payStatusClass = 'pay-success'; }
                  else if (pagadas > 0) { payStatusLabel = 'PARCIAL'; payStatusClass = 'pay-partial'; }
                  else if (facturadas > 0) { payStatusLabel = 'FACTURADO'; payStatusClass = 'pay-billed'; }
                }

                return (
                  <tr key={quote._id}>
                    <td>{quote.area}</td>
                    <td>{quote.clientName}</td>
                    <td>{quote.description}</td>
                    <td style={{fontWeight: showCosts ? 'normal' : 'bold', color: showCosts ? 'inherit' : '#b2bec3'}}>{showCosts ? `${fNum(neto)} UF` : '******'}</td>
                    <td style={{fontWeight: showCosts ? 'normal' : 'bold', color: showCosts ? 'inherit' : '#b2bec3'}}>{showCosts ? `${fNum(iva)} UF` : '******'}</td>
                    <td style={{fontWeight: showCosts ? 'normal' : 'bold', color: showCosts ? 'inherit' : '#b2bec3'}}>{showCosts ? <strong>{fNum(total)} UF</strong> : '******'}</td>
                    <td>{fFecha(quote.fechaEnvio)}</td>
                    <td>
                      <select 
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                        className={`status-select status-${quote.status.split('-')[0]}`}
                      >
                        <option value="0-PENDIENTE DE ENVIO">0-PENDIENTE DE ENVIO</option>
                        <option value="1-ESPERA RESPUESTA CLIENTE">1-ESPERA RESPUESTA CLIENTE</option>
                        <option value="2-ADJUDICADO">2-ADJUDICADO</option>
                        <option value="3-PERDIDO">3-PERDIDO</option>
                      </select>
                    </td>
                    <td><span className={`pay-badge ${payStatusClass}`}>{payStatusLabel}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => generatePDF(quote)} className="icon-btn pdf-btn" title="Descargar PDF"><FaFilePdf /></button>
                      <button onClick={() => handleDelete(quote._id)} className="icon-btn delete-btn-table" title="Eliminar"><FaTrash /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default Cotizaciones;
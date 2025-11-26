import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';              
import autoTable from 'jspdf-autotable'; 
import { API_URL } from '../config';
import { FaEye, FaEyeSlash, FaFilePdf, FaTrash, FaPlus, FaFilter, FaList, FaColumns, FaHashtag, FaBan, FaEdit } from "react-icons/fa"; // Importamos FaEdit

function Cotizaciones() {
  const [quotes, setQuotes] = useState([]);
  const [showCosts, setShowCosts] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [hideLost, setHideLost] = useState(true); 
  

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
      
      if (newStatus === '2-ADJUDICADO') {
        alert("¡Cotización Adjudicada!\n\nSe ha generado el código de Proyecto y se ha creado la tarea en el Tablero Principal.");
      }
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
    const netoPesos = Number(quote.netoCLP || 0);
    const iva = neto * 0.19;
    const total = neto + iva;
    const fNumPDF = (n) => Number(n).toFixed(2);
    const fCLP_PDF = (n) => '$ ' + Number(n).toLocaleString('es-CL');

    try {
      const img = new Image();
      img.src = '/LOGO_PI_FINAL.png'; 
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      doc.addImage(img, 'PNG', 15, 15, 45, 25); 
    } catch (error) { console.warn("Logo no cargado"); }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80); 
    doc.text("PUNTO INTEGRA", 200, 20, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Soluciones Integrales", 200, 26, { align: "right" });
    doc.text("Web: www.puntointegra.cl", 200, 31, { align: "right" });
    doc.text("Contacto: contacto@puntointegra.cl", 200, 36, { align: "right" });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 200, 46, { align: "right" });

    doc.setDrawColor(200);
    doc.line(15, 50, 195, 50);

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`COTIZACIÓN`, 105, 60, { align: "center" });
    if (quote.projectCode) {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Ref: ${quote.projectCode}`, 105, 65, { align: "center" });
    }

    doc.setFontSize(11);
    doc.setTextColor(0);
    
    let yPos = 75;
    const colLeft = 20;
    const colData = 50;

    const addClientRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, colLeft, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value || "-", colData, yPos);
      yPos += 7;
    };

    addClientRow("Cliente", quote.clientName);
    addClientRow("RUT", quote.clientRut);
    addClientRow("Giro", quote.clientGiro);
    addClientRow("Dirección", quote.clientAddress);
    addClientRow("Contacto", quote.clientContact);
    addClientRow("Email", quote.clientEmail);

    autoTable(doc, {
      startY: yPos + 10,
      head: [['Descripción / Servicio', 'Monto (CLP)', 'Monto (UF)']],
      body: [
        [
          quote.description, 
          netoPesos > 0 ? fCLP_PDF(netoPesos) : '-', 
          `${fNumPDF(neto)} UF`
        ]
      ],
      theme: 'striped', 
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 'auto' }, 
        1: { halign: 'right', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    const rightMargin = 180; 

    doc.setFontSize(11);
    doc.setTextColor(0);
    
    doc.text(`Neto:`, 140, finalY);
    doc.text(`${fNumPDF(neto)} UF`, rightMargin, finalY, { align: "right" });
    finalY += 7;
    
    doc.text(`IVA (19%):`, 140, finalY);
    doc.text(`${fNumPDF(iva)} UF`, rightMargin, finalY, { align: "right" });
    finalY += 10;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(135, finalY - 7, 60, 12, 'F'); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text(`TOTAL:`, 140, finalY);
    doc.text(`${fNumPDF(total)} UF`, rightMargin, finalY, { align: "right" });

    finalY += 50;
    if (finalY > 270) { doc.addPage(); finalY = 50; }

    const pageCenter = 105;
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(pageCenter - 40, finalY, pageCenter + 40, finalY); 
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("PUNTO INTEGRA", pageCenter, finalY + 6, { align: "center" });
    doc.text("Departamento Comercial", pageCenter, finalY + 11, { align: "center" });

    doc.save(`Cotizacion_${quote.clientName.replace(/ /g, '_')}.pdf`);
  };

  const fNum = (num) => Number(num).toFixed(2);
  const fCLP = (num) => Number(num).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  const fFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString();
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchClient = quote.clientName.toLowerCase().includes(filterClient.toLowerCase());
    const matchStatus = filterStatus ? quote.status === filterStatus : true;
    const matchCode = filterCode ? (quote.projectCode || '').toLowerCase().includes(filterCode.toLowerCase()) : true;

    const matchLost = hideLost ? quote.status !== '3-PERDIDO' : true;

    return matchClient && matchStatus && matchCode && matchLost;
  });

  return (
    <div className="cotizaciones-container">
      <div className="page-header">
        <div style={{display:'flex', alignItems:'center', gap:'15px', flexWrap:'wrap'}}>
          <h2>Gestión Comercial</h2>
          
          <div className="view-switch">
          </div>
        </div>

        <div className="header-actions">
          <button onClick={() => setShowCosts(!showCosts)} className="icon-btn eye-btn" title={showCosts ? "Ocultar Valores" : "Mostrar Valores"}>
            {showCosts ? <FaEye /> : <FaEyeSlash />} 
          </button>
          <Link to="/cotizaciones/crear" className="new-quote-link">
            <button className="btn-new-quote"><FaPlus /> Nueva Cotización</button>
          </Link>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-item">
          <span style={{color: '#636e72', fontSize: '0.9rem'}}><FaHashtag /> Código:</span>
          <input 
            type="text" placeholder="Ej: 2025_01..." value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)} className="filter-input" style={{minWidth: '100px'}}
          />
        </div>

        <div className="filter-item">
          <span style={{color: '#636e72', fontSize: '0.9rem'}}><FaFilter /> Cliente:</span>
          <input 
            type="text" placeholder="Buscar cliente..." value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)} className="filter-input"
          />
        </div>

        <div className="filter-item">
          <span style={{color: '#636e72', fontSize: '0.9rem'}}>Estado:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">-- Todos --</option>
            <option value="0-PENDIENTE DE ENVIO">Pendiente</option>
            <option value="1-ESPERA RESPUESTA CLIENTE">Enviada</option>
            <option value="2-ADJUDICADO">Adjudicado</option>
            <option value="3-PERDIDO">Perdido</option>
          </select>
        </div>
        
        <div className="filter-item" style={{justifyContent:'flex-end'}}>
           <button 
             onClick={() => setHideLost(!hideLost)}
             style={{
               background: hideLost ? '#d63031' : '#b2bec3',
               color: 'white', padding: '8px 12px', border: 'none', borderRadius: '5px',
               display: 'flex', alignItems: 'center', gap: '5px', height: '38px', marginTop:'20px'
             }}
             title="Ocultar/Mostrar Proyectos Perdidos"
           >
             <FaBan /> {hideLost ? 'Perdidos Ocultos' : 'Ver Perdidos'}
           </button>
        </div>
        
        <div style={{marginLeft: 'auto', alignSelf: 'end', fontSize: '0.9rem', color: '#0984e3', fontWeight: 'bold'}}>
           Resultados: {filteredQuotes.length}
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="table-wrapper">
          <table className="quote-table">
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Area</th>
                <th>Cliente</th>
                <th>Detalle</th>
                <th>Neto (CLP)</th>
                <th>Neto (UF)</th>
                <th>Total (UF)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 && (
                <tr><td colSpan="11" style={{textAlign: 'center', padding: '20px', color: '#999'}}>No se encontraron presupuestos.</td></tr>
              )}

              {filteredQuotes.map(quote => {
                const neto = Number(quote.netoUF || 0);
                const netoPesos = Number(quote.netoCLP || 0);
                const total = neto * 1.19;

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
                    <td>
                      {quote.projectCode ? (
                        <span className="project-code" style={{fontSize:'0.9rem'}}>{quote.projectCode}</span>
                      ) : (
                        <span style={{color:'#ccc', fontSize:'0.8rem'}}>-</span>
                      )}
                    </td>
                    <td>{quote.area}</td>
                    <td>{quote.clientName}</td>
                    <td>{quote.description}</td>
                    <td style={{fontWeight: showCosts ? 'bold' : 'normal', color: showCosts ? '#2d3436' : '#b2bec3'}}>
                      {showCosts ? fCLP(netoPesos) : '******'}
                    </td>
                    <td style={{fontWeight: showCosts ? 'normal' : 'bold', color: showCosts ? 'inherit' : '#b2bec3'}}>{showCosts ? `${fNum(neto)} UF` : '******'}</td>
                    <td style={{fontWeight: showCosts ? 'normal' : 'bold', color: showCosts ? 'inherit' : '#b2bec3'}}>
                      {showCosts ? <strong>{fNum(total)} UF</strong> : '******'}
                    </td>
                    <td>
                      <select 
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                        className={`status-select status-${quote.status.split('-')[0]}`}
                      >
                        <option value="0-PENDIENTE DE ENVIO">Pendiente</option>
                        <option value="1-ESPERA RESPUESTA CLIENTE">Enviada</option>
                        <option value="2-ADJUDICADO">Adjudicado</option>
                        <option value="3-PERDIDO">Perdido</option>
                      </select>
                    </td>
                    
                    <td className="actions-cell">
                      
                      { (quote.status === '0-PENDIENTE DE ENVIO' || quote.status === '1-ESPERA RESPUESTA CLIENTE') && (
                        <Link to={`/cotizaciones/editar/${quote._id}`}>
                          <button className="icon-btn edit-btn" title="Editar">
                            <FaEdit />
                          </button>
                        </Link>
                      )}

                      <button onClick={() => generatePDF(quote)} className="icon-btn pdf-btn" title="Descargar PDF"><FaFilePdf /></button>
                      <button onClick={() => handleDelete(quote._id)} className="icon-btn delete-btn-table" title="Eliminar"><FaTrash /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Cotizaciones;
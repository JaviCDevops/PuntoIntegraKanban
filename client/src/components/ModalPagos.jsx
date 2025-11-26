import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function ModalPagos({ project, onClose, onUpdate }) {
  const [numCuotas, setNumCuotas] = useState(1);
  const [payments, setPayments] = useState([]);
  
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    if (project.payments && project.payments.length > 0) {
      setPayments(project.payments);
      setNumCuotas(project.payments.length);
    } else {
      resetPayments(1);
    }

    if (project.deadline) setDeadline(new Date(project.deadline).toISOString().split('T')[0]);
    if (project.startDate) setStartDate(new Date(project.startDate).toISOString().split('T')[0]);
    if (project.reminderDate) setReminderDate(new Date(project.reminderDate).toISOString().split('T')[0]);
    if (project.expirationDate) setExpirationDate(new Date(project.expirationDate).toISOString().split('T')[0]);

  }, [project]);

  const resetPayments = (n) => {
    const equalPercent = 100 / n;
    const equalAmount = (project.netoUF * equalPercent) / 100;
    
    const newPayments = Array.from({ length: n }, () => ({
      percentage: Number(equalPercent.toFixed(2)),
      amount: Number(equalAmount.toFixed(2)),
      invoiceNumber: '',
      date: '',
      status: 'PENDIENTE'
    }));
    setPayments(newPayments);
  };

  const handleNumChange = (e) => {
    const n = parseInt(e.target.value) || 1;
    setNumCuotas(n);
    resetPayments(n);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;

    if (field === 'percentage') {
      const newAmount = (project.netoUF * value) / 100;
      updated[index].amount = Number(newAmount.toFixed(2));
    }
    
    if (field === 'amount') {
      const newPercent = (value * 100) / project.netoUF;
      updated[index].percentage = Number(newPercent.toFixed(2));
    }

    setPayments(updated);
  };

  const handleSave = async () => {
    const totalPercent = payments.reduce((acc, curr) => acc + Number(curr.percentage), 0);
    if (Math.abs(totalPercent - 100) > 0.5) {
      alert(`¡Atención! Los porcentajes suman ${totalPercent.toFixed(2)}%, deberían sumar 100%`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/quotes/${project._id}`, { 
        status: project.status,
        payments: payments,
        deadline, 
        startDate, 
        reminderDate, 
        expirationDate 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert("Proyecto actualizado correctamente");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
          <h3>Gestionar Proyecto: <span style={{color:'#0984e3'}}>{project.projectCode}</span></h3>
          <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#666'}}>✖</button>
        </div>

        <div className="modal-header-info">
          <p><strong>Cliente:</strong> {project.clientName}</p>
          <p><strong>Monto Total:</strong> {project.netoUF} UF</p>
        </div>

        <div className="payment-controls" style={{background:'#f0f7ff', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #cfe2ff'}}>
           <h4 style={{margin:'0 0 10px 0', color:'#084298'}}>Configuración de Plazos y Alertas</h4>
           
           <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>
             <div style={{display:'flex', flexDirection:'column'}}>
               <label style={{fontWeight:'bold'}}>Inicio Proyecto:</label>
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={(e)=>setStartDate(e.target.value)} 
                 style={{padding:'5px', border:'1px solid #ccc', borderRadius:'4px'}}
               />
             </div>
             <div style={{display:'flex', flexDirection:'column'}}>
               <label style={{fontWeight:'bold'}}>Entrega Final:</label>
               <input 
                 type="date" 
                 value={deadline} 
                 onChange={(e)=>setDeadline(e.target.value)} 
                 style={{padding:'5px', border:'1px solid #ccc', borderRadius:'4px'}}
               />
             </div>
           </div>

           <div style={{display:'flex', gap:'20px', flexWrap:'wrap', marginTop:'15px', borderTop:'1px solid #cfe2ff', paddingTop:'10px'}}>
             <div style={{display:'flex', flexDirection:'column'}}>
               <label style={{color:'#d63384', fontWeight:'bold'}}>Recordatorio:</label>
               <input 
                 type="date" 
                 value={reminderDate} 
                 onChange={(e)=>setReminderDate(e.target.value)} 
                 style={{padding:'5px', border:'1px solid #d63384', borderRadius:'4px'}}
               />
               <p style={{fontSize:'0.75rem', margin:'3px 0', color:'#666'}}>Te avisará en la campana este día.</p>
             </div>
             <div style={{display:'flex', flexDirection:'column'}}>
               <label style={{color:'#dc3545', fontWeight:'bold'}}>Perdido (Expiración):</label>
               <input 
                 type="date" 
                 value={expirationDate} 
                 onChange={(e)=>setExpirationDate(e.target.value)} 
                 style={{padding:'5px', border:'1px solid #dc3545', borderRadius:'4px'}}
               />
               <p style={{fontSize:'0.75rem', margin:'3px 0', color:'#666'}}>Si llega este día y no se adjudica, pasa a PERDIDO.</p>
             </div>
           </div>
        </div>

        <div className="payment-controls">
          <label>Cantidad de Pagos (Hitos): </label>
          <input 
            type="number" min="1" max="12" 
            value={numCuotas} 
            onChange={handleNumChange} 
            style={{width: '60px', padding: '5px', marginLeft: '10px', textAlign:'center'}}
          />
          <span style={{fontSize:'0.8rem', color:'#999', marginLeft:'10px'}}>(Reinicia los montos al cambiar)</span>
        </div>

        <div className="payment-list">
          {payments.map((p, i) => (
            <div key={i} className="payment-row">
              <span className="payment-index">Pago {i + 1}</span>
              
              <div className="input-group" style={{minWidth: '60px'}}>
                <label>%</label>
                <input type="number" value={p.percentage} onChange={(e) => handleRowChange(i, 'percentage', e.target.value)} />
              </div>

              <div className="input-group" style={{minWidth: '80px'}}>
                <label>Monto (UF)</label>
                <input type="number" value={p.amount} onChange={(e) => handleRowChange(i, 'amount', e.target.value)} />
              </div>

              <div className="input-group large">
                <label>N° Factura</label>
                <input type="text" placeholder="Pendiente..." value={p.invoiceNumber} onChange={(e) => handleRowChange(i, 'invoiceNumber', e.target.value)} />
              </div>

              <div className="input-group">
                <label>Estado</label>
                <select 
                  value={p.status} 
                  onChange={(e) => handleRowChange(i, 'status', e.target.value)}
                  className={
                    p.status === 'PAGADO' ? 'status-paid' : 
                    p.status === 'FACTURADO' ? 'status-billed' : 
                    'status-pending'
                  }
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="FACTURADO">FACTURADO</option>
                  <option value="PAGADO">PAGADO</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{marginTop:'20px'}}>
          <button className="save-btn-modal" onClick={handleSave}>Guardar Configuración</button>
        </div>
      </div>
    </div>
  );
}

export default ModalPagos;
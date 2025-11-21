import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function ModalPagos({ project, onClose, onUpdate }) {
  const [numCuotas, setNumCuotas] = useState(1);
  const [payments, setPayments] = useState([]);

  // Cargar datos existentes
  useEffect(() => {
    if (project.payments && project.payments.length > 0) {
      setPayments(project.payments);
      setNumCuotas(project.payments.length);
    } else {
      resetPayments(1);
    }
  }, [project]);

  const resetPayments = (n) => {
    const equalPercent = 100 / n;
    const equalAmount = (project.netoUF * equalPercent) / 100;
    
    const newPayments = Array.from({ length: n }, () => ({
      percentage: Number(equalPercent.toFixed(2)),
      amount: Number(equalAmount.toFixed(2)),
      invoiceNumber: '',
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
    if (Math.abs(totalPercent - 100) > 0.1) {
      alert(`¡Cuidado! Los porcentajes suman ${totalPercent}%, deberían sumar 100%`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/quotes/${project._id}`, { 
        status: project.status,
        payments: payments
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert("Pagos actualizados correctamente");
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <h3>Gestionar Pagos: {project.projectCode}</h3>
          <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>✖</button>
        </div>

        <div className="modal-header-info">
          <p><strong>Cliente:</strong> {project.clientName}</p>
          <p><strong>Monto Total Venta:</strong> {project.netoUF} UF</p>
        </div>

        <div className="payment-controls">
          <label>Cantidad de Pagos (OC): </label>
          <input 
            type="number" min="1" max="12" 
            value={numCuotas} 
            onChange={handleNumChange}
            style={{width: '60px', padding: '5px', marginLeft: '10px'}}
          />
        </div>

        <div className="payment-list">
          {payments.map((p, i) => (
            <div key={i} className="payment-row">
              <span className="payment-index">Pago {i + 1}</span>
              
              <div className="input-group">
                <label>%</label>
                <input 
                  type="number" 
                  value={p.percentage} 
                  onChange={(e) => handleRowChange(i, 'percentage', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Monto (UF)</label>
                <input 
                  type="number" 
                  value={p.amount} 
                  onChange={(e) => handleRowChange(i, 'amount', e.target.value)}
                />
              </div>

              <div className="input-group large">
                <label>N° Factura</label>
                <input 
                  type="text" placeholder="Pendiente..."
                  value={p.invoiceNumber} 
                  onChange={(e) => handleRowChange(i, 'invoiceNumber', e.target.value)}
                />
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

        <div className="modal-footer">
          <button className="save-btn-modal" onClick={handleSave}> Guardar Información de Pagos</button>
        </div>
      </div>
    </div>
  );
}

export default ModalPagos;
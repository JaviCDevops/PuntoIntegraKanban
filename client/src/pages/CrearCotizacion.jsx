import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { API_URL } from '../config';

function CrearCotizacion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  
  const [formData, setFormData] = useState({ 
    area: '', 
    clientName: '', 
    description: '', 
    netoUF: '',
    purchaseOrder: '', 
    clientRut: '', 
    clientGiro: '', 
    clientAddress: '', 
    clientContact: '', 
    clientEmail: '', 
    clientPhone: ''
  });

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const resClients = await axios.get(`${API_URL}/clients`, { headers });
        const sortedClients = resClients.data.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
        setClients(sortedClients);
      } catch (error) { console.error("Error cargando clientes"); }

      if (id) {
        try {
          const resQuote = await axios.get(`${API_URL}/quotes/${id}`, { headers });
          setFormData(resQuote.data);
        } catch (error) { 
          console.error("Error cargando cotización"); 
          alert("No se pudo cargar la cotización para editar.");
        }
      }
    };
    init();
  }, [id]);

  const handleClientChange = (e) => {
    const selectedName = e.target.value;
    
    const clientData = clients.find(c => c.razonSocial === selectedName);

    if (clientData) {
      setFormData({
        ...formData,
        clientName: selectedName,
        clientRut: clientData.rut,
        clientGiro: clientData.giro,
        clientAddress: clientData.direccion,
        clientContact: clientData.contactoNombre,
        clientEmail: clientData.email,
        clientPhone: clientData.telefono
      });
    } else {
      setFormData({ 
        ...formData, 
        clientName: '',
        clientRut: '', clientGiro: '', clientAddress: '', 
        clientContact: '', clientEmail: '', clientPhone: '' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.netoUF) {
      alert("Por favor completa los datos obligatorios (Cliente y Neto UF)");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        ...formData,
        netoUF: parseFloat(formData.netoUF)
      };

      if (id) {
        await axios.put(`${API_URL}/quotes/${id}`, payload, { headers });
        alert("Guardado correctamente");
        navigate(-1); 
      } else {
        payload.status = '0-PENDIENTE DE ENVIO'; 
        await axios.post(`${API_URL}/quotes`, payload, { headers });
        navigate('/cotizaciones'); 
      }

    } catch (error) {
      console.error("Error:", error.response?.data);
      alert(`Error al guardar: ${error.response?.data?.message || "Desconocido"}`);
    }
  };

  const readOnlyStyle = { backgroundColor: '#f1f2f6', color: '#636e72', cursor: 'default' };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center'}}>
        {id ? (formData.projectCode ? ` Editar Proyecto ${formData.projectCode}` : ' Editar Cotización') : 'Nueva Cotización'}
      </h2>
      
      <form onSubmit={handleSubmit} className="quote-form">
        
        <label>Area:</label>
        <input 
          type="text" required value={formData.area} 
          onChange={e => setFormData({...formData, area: e.target.value})} 
          placeholder="Ej: Marketing"
        />

        <label>Cliente:</label>
        <select 
          required value={formData.clientName} onChange={handleClientChange}
          style={{
            padding: '10px', borderRadius: '5px', border: '1px solid #ddd', 
            backgroundColor: '#fff', outline: 'none'
          }}
        >
          <option value="">-- Selecciona un Cliente --</option>
          {clients.map(c => <option key={c._id} value={c.razonSocial}>{c.razonSocial}</option>)}
        </select>
        
        {formData.clientName && (
          <div style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', margin: '10px 0'}}>
            <div>
                <label>RUT:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientRut || ''} />
            </div>
            <div>
                <label>Giro:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientGiro || ''} />
            </div>
            <div style={{gridColumn: '1 / -1'}}>
                <label>Dirección:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientAddress || ''} />
            </div>
            <div>
                <label>Contacto:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientContact || ''} />
            </div>
            <div>
                <label>Email:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientEmail || ''} />
            </div>
            <div>
                <label>Teléfono:</label>
                <input type="text" readOnly style={readOnlyStyle} value={formData.clientPhone || ''} />
            </div>
          </div>
        )}

        {id && (
          <div style={{gridColumn: '1 / -1', background:'#e3f2fd', padding:'15px', borderRadius:'8px', border:'1px solid #90caf9', marginBottom:'10px'}}>
            <label style={{color:'#1565c0', fontWeight:'bold'}}>📄 Orden de Compra (OC):</label>
            <input 
              type="text" 
              placeholder="Ingresa el código de la OC..." 
              value={formData.purchaseOrder || ''} 
              onChange={e => setFormData({...formData, purchaseOrder: e.target.value})}
              style={{borderColor:'#2196f3', width:'100%', padding:'10px', marginTop:'5px'}}
            />
          </div>
        )}

        <label>Detalle Servicio:</label>
        <input 
          type="text" required value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Descripción breve del trabajo"
        />
        
        <label>Neto en UF:</label>
        <input 
          type="number" step="0.01" required value={formData.netoUF} 
          onChange={e => setFormData({...formData, netoUF: e.target.value})} 
          placeholder="0.00"
        />

        <div style={{display: 'flex', gap: '10px', marginTop: '20px', gridColumn: '1 / -1'}}>
          <button type="submit" style={{background: '#0984e3'}}>
            {id ? 'Guardar Cambios' : 'Guardar Cotización'}
          </button>
          
          <button type="button" onClick={() => navigate(-1)} style={{background: '#b2bec3'}}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrearCotizacion;
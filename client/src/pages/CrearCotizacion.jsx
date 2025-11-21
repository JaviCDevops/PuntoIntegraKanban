import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function CrearCotizacion() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]); 
  
  // Estado ampliado con los nuevos campos
  const [formData, setFormData] = useState({ 
    area: '', 
    clientName: '', 
    description: '', 
    netoUF: '',
    // Campos automáticos
    clientRut: '',
    clientGiro: '',
    clientAddress: '',
    clientContact: '',
    clientEmail: '',
    clientPhone: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    fetchClients();
  }, []);

  // Lógica inteligente al seleccionar cliente
  const handleClientChange = (e) => {
    const selectedName = e.target.value;
    
    // 1. Buscamos el objeto cliente completo en nuestra lista
    const clientData = clients.find(c => c.razonSocial === selectedName);

    // 2. Si lo encontramos, rellenamos todo. Si no, limpiamos.
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
      alert("Por favor completa los datos obligatorios");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Enviamos todo el formData (incluyendo los datos automáticos)
      const payload = {
        ...formData,
        netoUF: parseFloat(formData.netoUF),
        status: '0-PENDIENTE DE ENVIO'
      };

      await axios.post(`${API_URL}/quotes`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/cotizaciones'); 

    } catch (error) {
      console.error("Error:", error.response?.data);
      alert(`Error al guardar: ${error.response?.data?.message || "Desconocido"}`);
    }
  };

  // Estilo para inputs de solo lectura (grisecitos)
  const readOnlyStyle = { backgroundColor: '#f1f2f6', color: '#636e72', cursor: 'not-allowed' };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center'}}>Nueva Cotización UF</h2>
      
      <form onSubmit={handleSubmit} className="quote-form">
        <label>Area:</label>
        <input 
          type="text" placeholder="Ej: Marketing" required 
          value={formData.area} 
          onChange={e => setFormData({...formData, area: e.target.value})} 
        />

        {/* SELECCIÓN DE CLIENTE */}
        <label>Cliente:</label>
        <select 
          required 
          value={formData.clientName} 
          onChange={handleClientChange} // Usamos la nueva función
          style={{
            padding: '10px', borderRadius: '5px', border: '1px solid #ddd', 
            backgroundColor: '#fff', color: '#2d3436', outline: 'none'
          }}
        >
          <option value="">-- Selecciona un Cliente --</option>
          {clients.map(client => (
            <option key={client._id} value={client.razonSocial}>
              {client.razonSocial}
            </option>
          ))}
        </select>
        
        {/* --- CAMPOS AUTOMÁTICOS (SOLO LECTURA) --- */}
        {formData.clientName && (
          <>
            <label>RUT:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientRut} />

            <label>Giro:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientGiro} />

            <label>Dirección:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientAddress} />

            <label>Contacto:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientContact} />

            <label>Email:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientEmail} />

            <label>Teléfono:</label>
            <input type="text" readOnly style={readOnlyStyle} value={formData.clientPhone} />
            
            {/* Separador visual */}
            <div style={{gridColumn: '1 / -1', borderBottom: '1px solid #eee', margin: '10px 0'}}></div>
          </>
        )}
        {/* ----------------------------------------- */}

        <label>Detalle Servicio:</label>
        <input 
          type="text" placeholder="Descripción del servicio" required 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
        />
        
        <label>Neto en UF:</label>
        <input 
          type="number" step="0.01" placeholder="Ej: 10.5" required 
          value={formData.netoUF} 
          onChange={e => setFormData({...formData, netoUF: e.target.value})} 
        />
        
        <div style={{display: 'flex', gap: '10px', marginTop: '20px', gridColumn: '1 / -1'}}>
          <button type="submit" style={{background: '#0984e3'}}>Guardar Cotización</button>
          <Link to="/cotizaciones" style={{width: '100%'}}>
            <button type="button" style={{background: '#b2bec3', width: '100%'}}>Cancelar</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default CrearCotizacion;
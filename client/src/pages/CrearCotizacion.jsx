import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function CrearCotizacion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    area: '', 
    clientName: '', 
    description: '', 
    netoUF: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/quotes`, formData);
      navigate('/cotizaciones'); 
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center'}}>Nueva Cotización UF</h2>
      
      <form onSubmit={handleSubmit} className="quote-form">
        <label>Area:</label>
        <input 
          type="text" placeholder="Ej: Marketing, TI, Ventas" required
          value={formData.area}
          onChange={e => setFormData({...formData, area: e.target.value})}
        />

        <label>Cliente:</label>
        <input 
          type="text" placeholder="Nombre del cliente" required
          value={formData.clientName}
          onChange={e => setFormData({...formData, clientName: e.target.value})}
        />
        
        <label>Detalle:</label>
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
        
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <button type="submit" style={{background: '#0984e3'}}>Guardar</button>
          <Link to="/cotizaciones" style={{width: '100%'}}>
            <button type="button" style={{background: '#b2bec3'}}>Cancelar</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default CrearCotizacion;
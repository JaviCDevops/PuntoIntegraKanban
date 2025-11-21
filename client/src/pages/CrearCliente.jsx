import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';

function CrearCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({ 
    rut: '', razonSocial: '', giro: '', direccion: '',
    contactoNombre: '', email: '', telefono: ''
  });

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFormData(res.data);
        } catch (error) {
          console.error("Error cargando cliente:", error);
          alert("No se pudo cargar el cliente.");
        }
      };
      fetchClient();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        await axios.put(`${API_URL}/clients/${id}`, formData, headers);
        alert("Cliente actualizado correctamente");
      } else {
        await axios.post(`${API_URL}/clients`, formData, headers);
        alert("Cliente guardado exitosamente");
      }
      navigate('/clientes'); 
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.data?.message?.includes('dup key')) {
        alert("Error: Ya existe un cliente con este RUT.");
      } else {
        alert("Error al guardar los cambios.");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center'}}>{id ? ' Editar Cliente' : 'Nuevo Cliente'}</h2>
      
      <form onSubmit={handleSubmit} className="quote-form">
        <label>RUT:</label>
        <input name="rut" type="text" placeholder="Ej: 76.123.456-K" required value={formData.rut} onChange={handleChange} />
        <label>Razón Social:</label>
        <input name="razonSocial" type="text" placeholder="Nombre Empresa SpA" required value={formData.razonSocial} onChange={handleChange} />
        <label>Giro:</label>
        <input name="giro" type="text" placeholder="Ej: Servicios Informáticos" value={formData.giro} onChange={handleChange} />
        <label>Dirección:</label>
        <input name="direccion" type="text" placeholder="Av. Siempre Viva 123" value={formData.direccion} onChange={handleChange} />
        <h3 style={{gridColumn: '1 / -1', marginTop: '20px', borderBottom: '1px solid #ddd'}}>Contacto</h3>
        <label>Nombre Contacto:</label>
        <input name="contactoNombre" type="text" placeholder="Juan Pérez" value={formData.contactoNombre} onChange={handleChange} />
        <label>Email:</label>
        <input name="email" type="email" placeholder="juan@empresa.com" value={formData.email} onChange={handleChange} />
        <label>Número (Teléfono):</label>
        <input name="telefono" type="text" placeholder="+56 9 ..." value={formData.telefono} onChange={handleChange} />
        
        <div style={{display: 'flex', gap: '10px', marginTop: '20px', gridColumn: '1 / -1'}}>
          <button type="submit" style={{background: '#0984e3', width: '100%'}}>{id ? 'Guardar Cambios' : 'Guardar Cliente'}</button>
          <Link to="/clientes" style={{width: '100%'}}><button type="button" style={{background: '#b2bec3', width: '100%'}}>Cancelar</button></Link>
        </div>
      </form>
    </div>
  );
}

export default CrearCliente;
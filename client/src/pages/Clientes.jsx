import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { FaTrash, FaPlus, FaBuilding, FaEdit } from "react-icons/fa";

function Clientes() {
  const [clients, setClients] = useState([]);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      // 1. RECUPERAR EL TOKEN
      const token = localStorage.getItem('token');
      
      // 2. ENVIARLO EN LA CABECERA
      const res = await axios.get(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar cliente?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter(c => c._id !== id));
    } catch (error) { alert("Error al eliminar"); }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h2>Cartera de Clientes</h2>
        <Link to="/clientes/crear" className="new-quote-link">
          <button className="btn-new-quote">
            <FaPlus /> Nuevo Cliente
          </button>
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="project-table">
          <thead>
            <tr>
              <th>RUT</th>
              <th>Razón Social</th>
              <th>Contacto</th>
              <th>Email / Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No hay clientes registrados.</td></tr>}
            
            {clients.map(client => (
              <tr key={client._id} style={{borderLeft: '5px solid #6c5ce7'}}>
                <td style={{fontWeight: 'bold'}}>{client.rut}</td>
                <td style={{color: '#2d3436', fontWeight: 'bold'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <FaBuilding style={{color:'#b2bec3'}}/> {client.razonSocial}
                  </div>
                  <span style={{fontSize:'0.8rem', color:'#636e72', fontWeight:'normal'}}>{client.giro}</span>
                </td>
                <td>{client.contactoNombre}</td>
                <td>
                  <div style={{fontSize:'0.9rem'}}>{client.email}</div>
                  <div style={{fontSize:'0.8rem', color:'#666'}}>{client.telefono}</div>
                </td>
                <td className="actions-cell">
                  <Link to={`/clientes/editar/${client._id}`}>
                    <button className="icon-btn edit-btn" title="Editar">
                      <FaEdit />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(client._id)} className="icon-btn delete-btn-table" title="Eliminar">
                    <FaTrash />
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

export default Clientes;
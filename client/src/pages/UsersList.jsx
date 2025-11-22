import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { FaEdit, FaTrash } from "react-icons/fa";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      alert("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizar lista visualmente
      setUsers(users.filter(u => u._id !== id));
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar el usuario.");
    }
  };

  const formatRole = (role) => {
    switch(role) {
      case 'admin': return '👑 Administrador';
      default: return '👤 Usuario Estándar';
    }
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>👥 Usuarios del Sistema</h2>
      
      {loading ? (
        <p style={{textAlign: 'center'}}>Cargando...</p>
      ) : (
        <div className="table-wrapper">
          <table className="project-table"> 
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Permisos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{borderLeft: user.role === 'admin' ? '6px solid #d63031' : '6px solid #0984e3'}}>
                  <td style={{fontWeight: 'bold'}}>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px', borderRadius: '15px', 
                      backgroundColor: user.role === 'admin' ? '#ffeaa7' : '#dfe6e9',
                      color: '#2d3436', fontWeight: 'bold', fontSize: '0.85rem'
                    }}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td>
                    <div style={{fontSize:'0.8rem', color:'#666'}}>
                        {user.role === 'admin' ? 'Acceso Total' : (user.permissions?.length || 0) + ' accesos'}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/admin/users/edit/${user._id}`}>
                        <button className="icon-btn edit-btn" title="Editar Permisos">
                            <FaEdit />
                        </button>
                    </Link>
                    
                    {/* BOTÓN DE ELIMINAR */}
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      className="icon-btn delete-btn-table" 
                      title="Eliminar Usuario"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersList;
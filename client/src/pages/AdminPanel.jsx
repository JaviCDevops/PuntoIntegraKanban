import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function AdminPanel() {
  const { id } = useParams(); // Detectar si estamos editando
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'user'
  });

  // Estado para los checkboxes
  const [selectedPerms, setSelectedPerms] = useState({
    access_kanban: false,
    access_quotes: false,
    access_projects: false,
    access_clients: false
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const u = res.data;
          setFormData({ username: u.username, email: u.email, password: '', role: u.role });
          
          // Rellenar permisos
          const perms = { ...selectedPerms };
          if (u.permissions) {
            u.permissions.forEach(p => { if (perms.hasOwnProperty(p)) perms[p] = true; });
          }
          setSelectedPerms(perms);

        } catch (error) {
          console.error(error);
          alert("Error cargando usuario");
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleCheck = (e) => {
    setSelectedPerms({ ...selectedPerms, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const permissionsArray = Object.keys(selectedPerms).filter(key => selectedPerms[key]);
      
      const payload = { ...formData, permissions: permissionsArray };
      
      // Si es edición y no puso password, la borramos del payload para no enviarla vacía
      if (id && !formData.password) delete payload.password;

      if (id) {
        // PUT
        await axios.put(`${API_URL}/admin/users/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuario actualizado correctamente");
      } else {
        // POST
        await axios.post(`${API_URL}/admin/create-user`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuario creado correctamente");
      }
      
      navigate('/admin/users');

    } catch (error) {
      alert(error.response?.data?.message || "Error en la operación");
    }
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center'}}>
        {id ? ' Editar Usuario y Permisos' : ' Crear Usuario'}
      </h2>

      <form onSubmit={handleSubmit} className="quote-form" style={{maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column'}}>
        
        <label>Usuario:</label>
        <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
        
        <label>Email:</label>
        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        
        <label>Contraseña {id && <span style={{fontSize:'0.8em', fontWeight:'normal'}}>(Dejar en blanco para mantener la actual)</span>}:</label>
        <input 
          type="password" 
          // Requerido solo si es CREAR nuevo
          required={!id} 
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          placeholder={id ? "********" : ""}
        />

        <label>Tipo de Cuenta:</label>
        <select 
          value={formData.role} 
          onChange={e => setFormData({...formData, role: e.target.value})}
          style={{padding: '10px', marginBottom: '20px', borderRadius:'5px'}}
        >
          <option value="user">Usuario Estándar (Requiere Permisos)</option>
          <option value="admin">Administrador (Acceso Total)</option>
        </select>

        {/* SECCIÓN DE PERMISOS */}
        {formData.role === 'user' && (
          <div style={{background: '#f1f2f6', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <h4 style={{marginTop: 0, color: '#2d3436'}}>Accesos permitidos:</h4>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor:'pointer'}}>
                <input type="checkbox" name="access_kanban" checked={selectedPerms.access_kanban} onChange={handleCheck} />
                 Ver Tablero Kanban
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor:'pointer'}}>
                <input type="checkbox" name="access_quotes" checked={selectedPerms.access_quotes} onChange={handleCheck} />
                 Ver Presupuestos
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor:'pointer'}}>
                <input type="checkbox" name="access_projects" checked={selectedPerms.access_projects} onChange={handleCheck} />
                 Ver Proyectos PXX
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor:'pointer'}}>
                <input type="checkbox" name="access_clients" checked={selectedPerms.access_clients} onChange={handleCheck} />
                 Ver Clientes
              </label>
            </div>
          </div>
        )}

        <button type="submit">{id ? 'Guardar Cambios' : 'Crear Usuario'}</button>
      </form>
    </div>
  );
}

export default AdminPanel;
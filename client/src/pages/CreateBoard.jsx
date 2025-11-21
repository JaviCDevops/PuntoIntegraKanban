import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config';

function CreateBoard() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID del tablero si estamos editando
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Cargar datos iniciales (Usuarios y Tablero si es edición)
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Cargar Usuarios
      try {
        const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(usersRes.data);
      } catch (error) { console.error("Error cargando usuarios"); }

      // 2. Si hay ID, Cargar datos del tablero
      if (id) {
        try {
          const boardRes = await axios.get(`${API_URL}/boards/${id}`, { headers });
          const board = boardRes.data;
          setTitle(board.title);
          setDescription(board.description);
          // board.members suele ser array de IDs en la DB, o objetos si usas populate.
          // Como usamos findById sin populate en la ruta get/:id del backend, vienen IDs.
          setSelectedMembers(board.members || []);
        } catch (error) { 
          console.error("Error cargando tablero"); 
          alert("No se pudo cargar el tablero");
        }
      }
    };
    initData();
  }, [id]);

  const handleCheckbox = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(mid => mid !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { title, description, members: selectedMembers };
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        // EDITAR
        await axios.put(`${API_URL}/boards/${id}`, payload, headers);
        alert("Tablero actualizado correctamente");
      } else {
        // CREAR
        await axios.post(`${API_URL}/boards`, payload, headers);
        alert("Tablero creado exitosamente");
      }
      
      navigate('/boards');
    } catch (error) {
      alert("Error al guardar tablero");
    }
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign:'center'}}>{id ? ' Editar Tablero' : 'Nuevo Tablero Kanban'}</h2>
      
      <form onSubmit={handleSubmit} className="quote-form" style={{maxWidth:'600px', margin:'0 auto', display:'flex', flexDirection:'column'}}>
        <label>Título del Tablero:</label>
        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Desarrollo Web" />
        
        <label>Descripción:</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Tareas del equipo dev" />

        <label style={{marginTop:'20px'}}>Asignar Miembros:</label>
        <div style={{background:'#fff', padding:'15px', border:'1px solid #ddd', borderRadius:'5px', maxHeight:'200px', overflowY:'auto'}}>
          {users.map(u => (
            <div key={u._id} style={{marginBottom:'8px', display:'flex', gap:'10px'}}>
              <input 
                type="checkbox" 
                checked={selectedMembers.includes(u._id)} 
                onChange={() => handleCheckbox(u._id)}
              />
              <span>{u.username} ({u.role})</span>
            </div>
          ))}
        </div>

        <button type="submit" style={{marginTop:'20px'}}>{id ? 'Guardar Cambios' : 'Crear Tablero'}</button>
      </form>
    </div>
  );
}

export default CreateBoard;
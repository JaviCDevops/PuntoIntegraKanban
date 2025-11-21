import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config';
import { FaPlus, FaTrash } from "react-icons/fa";

function CreateBoard() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // COLUMNAS
  const [columns, setColumns] = useState([
    { id: 'col-1', title: 'Pendiente', color: '#ff7675' },
    { id: 'col-2', title: 'En Proceso', color: '#fdcb6e' },
    { id: 'col-3', title: 'Terminado', color: '#55efc4' }
  ]);

  // FILAS (NUEVO)
  const [rows, setRows] = useState([
    { id: 'row-1', title: 'General', color: '#74b9ff' }
  ]);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(usersRes.data);
      } catch (error) { console.error("Error users"); }

      if (id) {
        try {
          const boardRes = await axios.get(`${API_URL}/boards/${id}`, { headers });
          const board = boardRes.data;
          setTitle(board.title);
          setDescription(board.description);
          setSelectedMembers(board.members || []);
          if (board.columns?.length > 0) setColumns(board.columns);
          if (board.rows?.length > 0) setRows(board.rows);
        } catch (error) { alert("Error cargando tablero"); }
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

  // --- GESTIÓN COLUMNAS ---
  const addColumn = () => setColumns([...columns, { id: `col-${Date.now()}`, title: 'Nueva Columna', color: '#dfe6e9' }]);
  const removeColumn = (cid) => columns.length > 1 && setColumns(columns.filter(c => c.id !== cid));
  const updateColumn = (cid, field, val) => setColumns(columns.map(c => c.id === cid ? { ...c, [field]: val } : c));

  // --- GESTIÓN FILAS (NUEVO) ---
  const addRow = () => setRows([...rows, { id: `row-${Date.now()}`, title: 'Nueva Fila', color: '#a29bfe' }]);
  const removeRow = (rid) => rows.length > 1 && setRows(rows.filter(r => r.id !== rid));
  const updateRow = (rid, field, val) => setRows(rows.map(r => r.id === rid ? { ...r, [field]: val } : r));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { title, description, members: selectedMembers, columns, rows };
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      if (id) await axios.put(`${API_URL}/boards/${id}`, payload, headers);
      else await axios.post(`${API_URL}/boards`, payload, headers);
      
      alert("Tablero guardado exitosamente");
      navigate('/boards');
    } catch (error) { alert("Error al guardar"); }
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign:'center'}}>{id ? '✏️ Editar Tablero' : 'Nuevo Tablero'}</h2>
      
      <form onSubmit={handleSubmit} className="quote-form" style={{maxWidth:'900px', margin:'0 auto', display:'flex', flexDirection:'column'}}>
        
        {/* DATOS BÁSICOS */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%'}}>
          <div><label>Título:</label><input type="text" required value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label>Descripción:</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} /></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%', marginTop:'20px'}}>
          
          {/* GESTOR DE COLUMNAS */}
          <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'8px', border:'1px solid #eee'}}>
            <label style={{marginBottom:'10px', display:'block'}}>COLUMNAS (Vertical):</label>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {columns.map((col, i) => (
                <div key={col.id} style={{display:'flex', gap:'5px', alignItems:'center'}}>
                  <span style={{color:'#aaa', width:'15px'}}>{i+1}</span>
                  <input type="text" value={col.title} onChange={(e) => updateColumn(col.id, 'title', e.target.value)} placeholder="Nombre" />
                  <input type="color" value={col.color} onChange={(e) => updateColumn(col.id, 'color', e.target.value)} style={{width:'30px', padding:0, height:'35px'}} />
                  <button type="button" onClick={() => removeColumn(col.id)} className="icon-btn delete-btn" style={{margin:0}}><FaTrash /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addColumn} style={{marginTop:'10px', background:'#636e72', fontSize:'0.8rem', width:'100%'}}><FaPlus /> Agregar Columna</button>
          </div>

          {/* GESTOR DE FILAS */}
          <div style={{background:'#f0f2f5', padding:'15px', borderRadius:'8px', border:'1px solid #eee'}}>
            <label style={{marginBottom:'10px', display:'block'}}>FILAS (Horizontal):</label>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {rows.map((row, i) => (
                <div key={row.id} style={{display:'flex', gap:'5px', alignItems:'center'}}>
                  <span style={{color:'#aaa', width:'15px'}}>{i+1}</span>
                  <input type="text" value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} placeholder="Nombre Fila" />
                  <button type="button" onClick={() => removeRow(row.id)} className="icon-btn delete-btn" style={{margin:0}}><FaTrash /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} style={{marginTop:'10px', background:'#6c5ce7', fontSize:'0.8rem', width:'100%'}}><FaPlus /> Agregar Fila</button>
          </div>

        </div>

        {/* MIEMBROS */}
        <label style={{marginTop:'20px'}}>Asignar Miembros:</label>
        <div style={{background:'#fff', padding:'15px', border:'1px solid #ddd', borderRadius:'5px', maxHeight:'150px', overflowY:'auto'}}>
          {users.map(u => (
            <div key={u._id} style={{marginBottom:'8px', display:'flex', gap:'10px'}}>
              <input type="checkbox" checked={selectedMembers.includes(u._id)} onChange={() => handleCheckbox(u._id)} />
              <span>{u.username} ({u.role})</span>
            </div>
          ))}
        </div>

        <button type="submit" style={{marginTop:'20px', width:'100%'}}>Guardar Tablero Completo</button>
      </form>
    </div>
  );
}

export default CreateBoard;
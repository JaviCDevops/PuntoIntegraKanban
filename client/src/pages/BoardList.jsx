import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { FaPlus, FaColumns, FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';

function BoardList() {
  const [boards, setBoards] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/boards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBoards(res.data);
  };

  const handleDelete = async (e, boardId) => {
    e.preventDefault(); // Evitar que el Link se active al hacer clic en el botón
    if (!window.confirm("¿Seguro? Se borrarán TODAS las tareas de este tablero.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBoards(); // Recargar lista
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h2>Mis Tableros</h2>
        {user.role === 'admin' && (
          <Link to="/boards/create" style={{textDecoration:'none'}}>
            <button className="btn-new-quote"><FaPlus /> Crear Tablero</button>
          </Link>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
        {boards.length === 0 && <p>No tienes tableros asignados.</p>}
        
        {boards.map(board => (
          <Link key={board._id} to={`/board/${board._id}`} style={{textDecoration:'none', color:'inherit'}}>
            <div style={{
              background:'white', padding:'20px', borderRadius:'10px', 
              boxShadow:'0 4px 10px rgba(0,0,0,0.1)', borderLeft:'5px solid #0984e3',
              cursor:'pointer', transition:'transform 0.2s', position: 'relative'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                  <FaColumns size={24} color="#0984e3"/>
                  <h3 style={{margin:0}}>{board.title}</h3>
                </div>

                {/* BOTONES ADMIN (Editar / Borrar) */}
                {user.role === 'admin' && (
                  <div style={{display:'flex', gap:'5px'}}>
                    <Link to={`/boards/edit/${board._id}`} onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn edit-btn" style={{width:'30px', height:'30px', fontSize:'0.9rem'}}>
                        <FaEdit />
                      </button>
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, board._id)} 
                      className="icon-btn delete-btn-table" 
                      style={{width:'30px', height:'30px', fontSize:'0.9rem'}}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <p style={{color:'#666', fontSize:'0.9rem', marginTop:0}}>{board.description || 'Sin descripción'}</p>
              <div style={{marginTop:'15px', fontSize:'0.8rem', color:'#b2bec3', fontWeight:'bold'}}>
                👥 {board.members.length} Miembros
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BoardList;
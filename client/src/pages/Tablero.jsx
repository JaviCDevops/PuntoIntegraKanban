import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';
import { API_URL } from '../config';

function Tablero() {
  const { id } = useParams(); 
  const navigate = useNavigate(); // Para redirigir si hay error
  const [boardData, setBoardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');

  const columns = {
    pendiente: { title: "Pendiente", color: "#ff7675" },
    en_progreso: { title: "En Proceso", color: "#fdcb6e" },
    completada: { title: "Terminado", color: "#55efc4" }
  };

  useEffect(() => {
    // 1. VALIDACIÓN PREVENTIVA
    if (!id || id === 'undefined') {
      alert("ID de tablero no válido. Volviendo a la lista.");
      navigate('/boards');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Cargar Info del Tablero
        const boardRes = await axios.get(`${API_URL}/boards/${id}`, { headers });
        setBoardData(boardRes.data);

        // Cargar Tareas
        const tasksRes = await axios.get(`${API_URL}/tasks/board/${id}`, { headers });
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Error cargando tablero:", error);
        // Si falla (ej: 404 o 500), no rompemos la app, solo mostramos aviso
        if (error.response?.status === 404 || error.response?.status === 400) {
           alert("El tablero no existe o no tienes acceso.");
           navigate('/boards');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const fetchTasks = async () => {
    if (!id || id === 'undefined') return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tasks/board/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) { console.error(error); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, { 
        title: newTaskTitle, 
        boardId: id 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('¿Borrar?')) {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    }
  };

  const startEditing = (task) => { setEditingId(task._id); setEditText(task.title); };
  
  const saveEdit = async (taskId) => {
    try { 
      await axios.put(`${API_URL}/tasks/${taskId}`, { title: editText });
      const updated = tasks.map(t => t._id === taskId ? { ...t, title: editText } : t);
      setTasks(updated); setEditingId(null); 
    } catch (e) { console.error(e); }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map(t => t._id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    try { await axios.put(`${API_URL}/tasks/${draggableId}`, { status: newStatus }); } 
    catch (error) { fetchTasks(); }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'50px'}}>Cargando...</p>;
  if (!boardData) return null;

  return (
    <div className="table-wrapper">
      <div className="app-container">
        <div style={{display:'flex', alignItems:'center', gap:'20px', justifyContent:'center', marginBottom:'30px'}}>
          <Link to="/boards" style={{color:'#666', textDecoration:'none', fontSize:'1.2rem'}}>← Volver</Link>
          <h1 style={{margin:0}}>{boardData.title}</h1>
        </div>
        
        <form onSubmit={handleCreateTask} className="task-form">
          <input 
            type="text" placeholder="Nueva tarea en este tablero..."
            value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit">Agregar</button>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {Object.entries(columns).map(([columnId, columnData]) => (
              <div key={columnId} className="kanban-column">
                <h2 style={{ borderBottom: `4px solid ${columnData.color}` }}>{columnData.title}</h2>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="column-content">
                      {tasks.filter(task => task.status === columnId).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="kanban-card">
                                {editingId === task._id ? (
                                  <div className="edit-mode">
                                    <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                                    <div className="edit-actions">
                                      <button onClick={() => saveEdit(task._id)} className="save-btn">✔</button>
                                      <button onClick={() => setEditingId(null)} className="cancel-btn">✖</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p>{task.title}</p>
                                    <div className="card-actions">
                                      <button onClick={() => handleDelete(task._id)} className="delete-btn">X</button>
                                      <button onClick={() => startEditing(task)} className="edit-btn">✎</button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Tablero;
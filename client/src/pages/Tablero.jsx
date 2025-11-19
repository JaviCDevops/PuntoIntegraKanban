import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';

function Tablero() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [editingId, setEditingId] = useState(null); // ID de la tarea que se está editando
  const [editText, setEditText] = useState('');     // Texto temporal mientras escribes

  const API_URL = 'http://localhost:5000/api/tasks';

  const columns = {
    pendiente: { title: "Pendiente", color: "#ff7675" },
    en_progreso: { title: "En Proceso", color: "#fdcb6e" },
    completada: { title: "Terminado", color: "#55efc4" }
  };

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (error) { console.error(error); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await axios.post(API_URL, { title: newTaskTitle });
    setNewTaskTitle('');
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Borrar?')) {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    }
  };

  // --- FUNCIONES DE EDICIÓN ---
  const startEditing = (task) => {
    setEditingId(task._id); // Activamos modo edición para esta ID
    setEditText(task.title); // Ponemos el texto actual en el input
  };

  const saveEdit = async (id) => {
    try {
      // Actualizamos en Backend (Tu ruta PUT ya maneja body completo, así que actualizará title)
      await axios.put(`${API_URL}/${id}`, { title: editText });
      
      // Actualizamos en Frontend (Optimista o recarga)
      const updatedTasks = tasks.map(t => 
        t._id === id ? { ...t, title: editText } : t
      );
      setTasks(updatedTasks);
      setEditingId(null); // Salimos del modo edición
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await axios.put(`${API_URL}/${draggableId}`, { status: newStatus });
    } catch (error) {
      console.error("Error al mover:", error);
      fetchTasks(); 
    }
  };

  return (
    <div className="table-wrapper">
      <div className="app-container">
        <h1>Tablero Kanban</h1>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {Object.entries(columns).map(([columnId, columnData]) => (
              <div key={columnId} className="kanban-column">
                <h2 style={{ borderBottom: `4px solid ${columnData.color}` }}>
                  {columnData.title}
                </h2>

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="column-content">
                      {tasks.filter(task => task.status === columnId).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="kanban-card"
                              >
                                {/* LOGICA DE VISUALIZACIÓN: ¿Estamos editando ESTA tarjeta? */}
                                {editingId === task._id ? (
                                  <div className="edit-mode">
                                    <input 
                                      value={editText} 
                                      onChange={(e) => setEditText(e.target.value)}
                                      autoFocus
                                    />
                                    <div className="edit-actions">
                                      <button onClick={() => saveEdit(task._id)} className="save-btn">✔</button>
                                      <button onClick={() => setEditingId(null)} className="cancel-btn">✖</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p>{task.title}</p>
                                    <div className="card-actions">
                                      {/* Botón Borrar (X) */}
                                      <button onClick={() => handleDelete(task._id)} className="delete-btn">X</button>
                                      {/* Botón Editar (Lapiz/Texto) debajo */}
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
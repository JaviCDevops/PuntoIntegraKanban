import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';
import { API_URL } from '../config';

function Tablero() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');     

  const columns = {
    pendiente: { title: "Pendiente", color: "#ff7675" },
    en_progreso: { title: "En Proceso", color: "#fdcb6e" },
    completada: { title: "Terminado", color: "#55efc4" }
  };

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      // CORRECCIÓN 1: Agregar /tasks
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (error) { console.error(error); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    // CORRECCIÓN 2: Agregar /tasks
    await axios.post(`${API_URL}/tasks`, { title: newTaskTitle });
    setNewTaskTitle('');
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Borrar?')) {
      // CORRECCIÓN 3: Agregar /tasks antes del ID
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id); 
    setEditText(task.title); 
  };

  const saveEdit = async (id) => {
    try {
      // CORRECCIÓN 4: Agregar /tasks antes del ID
      await axios.put(`${API_URL}/tasks/${id}`, { title: editText });
      
      const updatedTasks = tasks.map(t => 
        t._id === id ? { ...t, title: editText } : t
      );
      setTasks(updatedTasks);
      setEditingId(null); 
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
      // CORRECCIÓN 5: Agregar /tasks antes del ID del elemento arrastrado
      await axios.put(`${API_URL}/tasks/${draggableId}`, { status: newStatus });
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
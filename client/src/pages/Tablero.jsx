import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';
import { API_URL } from '../config';

function Tablero() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [boardData, setBoardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!id || id === 'undefined') { navigate('/boards'); return; }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const boardRes = await axios.get(`${API_URL}/boards/${id}`, { headers });
        setBoardData(boardRes.data);
        const tasksRes = await axios.get(`${API_URL}/tasks/board/${id}`, { headers });
        setTasks(tasksRes.data);
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400) {
           alert("Tablero no encontrado."); navigate('/boards');
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  const handleCreateTask = async (rowId) => {
    if (!newTaskTitle.trim()) return;
    // Asignamos a la primera columna de esa fila
    const firstColId = boardData.columns[0]?.id || 'col-1';
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, { 
        title: newTaskTitle, 
        boardId: id,
        status: firstColId, // Columna
        rowId: rowId        // Fila
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewTaskTitle('');
      const res = await axios.get(`${API_URL}/tasks/board/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
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
    try { await axios.put(`${API_URL}/tasks/${taskId}`, { title: editText });
      const updated = tasks.map(t => t._id === taskId ? { ...t, title: editText } : t);
      setTasks(updated); setEditingId(null); 
    } catch (e) { console.error(e); }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    // Desempaquetamos el ID compuesto: "rowId::colId"
    const [newRowId, newColId] = destination.droppableId.split('::');

    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newColId, rowId: newRowId } : t
    );
    setTasks(updatedTasks);
    
    try { 
      await axios.put(`${API_URL}/tasks/${draggableId}`, { 
        status: newColId, 
        rowId: newRowId 
      }); 
    } catch (error) { 
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/tasks/board/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setTasks(res.data);
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'50px'}}>Cargando...</p>;
  if (!boardData) return null;

  const columnsToRender = (boardData.columns && boardData.columns.length > 0) ? boardData.columns : [{ id: 'def', title: 'Columna', color: '#ccc' }];
  const rowsToRender = (boardData.rows && boardData.rows.length > 0) ? boardData.rows : [{ id: 'def-row', title: 'General' }];

  return (
    <div className="table-wrapper">
      <div className="app-container" style={{maxWidth: '100%'}}>
        <div style={{display:'flex', alignItems:'center', gap:'20px', justifyContent:'center', marginBottom:'20px'}}>
          <Link to="/boards" style={{color:'#666', textDecoration:'none', fontSize:'1.2rem'}}>← Volver</Link>
          <h1 style={{margin:0}}>{boardData.title}</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="swimlane-board">
            
            {/* HEADER DE COLUMNAS (SOLO UNA VEZ ARRIBA) */}
            <div className="swimlane-header">
              <div className="swimlane-corner"></div> {/* Espacio vacío esquina sup izq */}
              {columnsToRender.map(col => (
                <div key={col.id} className="swimlane-col-header" style={{borderTop: `4px solid ${col.color}`}}>
                  {col.title}
                </div>
              ))}
            </div>

            {/* FILAS (SWIMLANES) */}
            {rowsToRender.map(row => (
              <div key={row.id} className="swimlane-row">
                {/* Título de la Fila (Vertical a la izquierda o normal) */}
                <div className="swimlane-row-header">
                  <h3>{row.title}</h3>
                  {/* Formulario rápido para agregar en esta fila */}
                  <div className="quick-add">
                    <input 
                      type="text" placeholder="+ Tarea..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setNewTaskTitle(e.target.value);
                          // Truco sucio para usar el estado en el closure del evento, 
                          // idealmente usar un estado por fila o componente separado.
                          // Aquí asumimos que el usuario escribe y da enter rápido.
                          // Para producción, mejor separar en componente <RowInput />
                          newTaskTitle === '' ? setNewTaskTitle(e.target.value) : null; 
                          handleCreateTask(row.id);
                          e.target.value = '';
                        } else {
                          setNewTaskTitle(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Celdas de la fila (Intersección Fila x Columna) */}
                {columnsToRender.map(col => {
                  // ID compuesto único para el Droppable
                  const dropId = `${row.id}::${col.id}`;
                  
                  // Filtramos tareas que coincidan con AMBOS IDs (o que no tengan rowId si es la fila default)
                  const cellTasks = tasks.filter(t => 
                    t.status === col.id && (t.rowId === row.id || (!t.rowId && row.id === 'def-row'))
                  );

                  return (
                    <Droppable key={dropId} droppableId={dropId}>
                      {(provided, snapshot) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          className={`swimlane-cell ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        >
                          {cellTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="kanban-card">
                                  {editingId === task._id ? (
                                    <div className="edit-mode">
                                      <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                                      <button onClick={() => saveEdit(task._id)} className="save-btn">✔</button>
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
                  );
                })}
              </div>
            ))}

          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Tablero;
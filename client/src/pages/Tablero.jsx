import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';
import { API_URL } from '../config';
import { FaCheckSquare, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter } from 'react-icons/fa';

function Tablero() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [boardData, setBoardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const [filterQuery, setFilterQuery] = useState('');

  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklistInput, setChecklistInput] = useState('');

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/boards');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const boardRes = await axios.get(`${API_URL}/boards/${id}`, { headers });
        setBoardData(boardRes.data);

        const tasksRes = await axios.get(`${API_URL}/tasks/board/${id}`, { headers });
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Error cargando tablero:", error);
        if (error.response?.status === 404 || error.response?.status === 400) {
           alert("Tablero no encontrado o sin acceso.");
           navigate('/boards');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCreateTask = async (rowId, titleVal) => {
    const titleToUse = titleVal || newTaskTitle;
    if (!titleToUse.trim()) return;
    
    const firstColId = boardData?.columns?.[0]?.id || 'pendiente';
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks`, { 
        title: titleToUse, 
        boardId: id,
        status: firstColId, 
        rowId: rowId        
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewTaskTitle('');
      const res = await axios.get(`${API_URL}/tasks/board/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (e, taskId) => {
    e.stopPropagation(); 
    if (window.confirm('¿Borrar tarea?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(tasks.filter(t => t._id !== taskId));
        if (selectedTask?._id === taskId) setSelectedTask(null); 
      } catch (error) { console.error("Error borrando tarea", error); }
    }
  };

  const startEditing = (e, task) => { 
    e.stopPropagation();
    setEditingId(task._id); 
    setEditText(task.title); 
  };
  
  const saveEdit = async (taskId) => {
    try { 
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${taskId}`, { title: editText }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const updated = tasks.map(t => t._id === taskId ? { ...t, title: editText } : t);
      setTasks(updated); setEditingId(null); 
    } catch (e) { console.error(e); }
  };

  const handleAddCheckItem = async () => {
    if (!checklistInput.trim() || !selectedTask) return;
    const updatedChecklist = [...(selectedTask.checklist || []), { text: checklistInput, done: false }];
    await updateTaskChecklist(updatedChecklist);
    setChecklistInput('');
  };

  const handleToggleCheckItem = async (idx) => {
    const updatedChecklist = [...selectedTask.checklist];
    updatedChecklist[idx].done = !updatedChecklist[idx].done;
    await updateTaskChecklist(updatedChecklist);
  };

  const handleDeleteCheckItem = async (idx) => {
    const updatedChecklist = selectedTask.checklist.filter((_, i) => i !== idx);
    await updateTaskChecklist(updatedChecklist);
  };

  const updateTaskChecklist = async (newChecklist) => {
    const updatedTask = { ...selectedTask, checklist: newChecklist };
    setSelectedTask(updatedTask);
    setTasks(tasks.map(t => t._id === selectedTask._id ? updatedTask : t));

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${selectedTask._id}/checklist`, 
        { checklist: newChecklist }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) { console.error("Error guardando checklist"); }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const [newRowId, newColId] = destination.droppableId.split('::');

    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newColId, rowId: newRowId } : t
    );
    setTasks(updatedTasks);
    
    try { 
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${draggableId}`, { 
        status: newColId, 
        rowId: newRowId 
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      }); 
    } catch (error) { 
        console.error("Error moviendo tarea", error);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/tasks/board/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setTasks(res.data);
    }
  };

  if (loading) return <p style={{textAlign:'center', marginTop:'50px'}}>Cargando...</p>;
  if (!boardData) return null;

  const columnsToRender = (boardData.columns && boardData.columns.length > 0) ? boardData.columns : [{ id: 'pendiente', title: 'Pendiente', color: '#ff7675' }];
  const rowsToRender = (boardData.rows && boardData.rows.length > 0) ? boardData.rows : [{ id: 'def-row', title: 'General' }];

  return (
    <div className="table-wrapper">
      <div className="app-container" style={{maxWidth: '100%'}}>
        
        <div className="page-header">
          <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
            <Link to="/boards" style={{color:'#666', textDecoration:'none', fontSize:'1.2rem'}}>← Volver</Link>
            <h2 style={{margin:0}}>{boardData.title}</h2>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f1f2f6', padding:'8px 15px', borderRadius:'20px', width:'100%', maxWidth:'400px'}}>
             <FaSearch style={{color:'#999'}} />
             <input 
               type="text" 
               placeholder="Buscar por código de proyecto o tarea..." 
               value={filterQuery}
               onChange={(e) => setFilterQuery(e.target.value)}
               style={{border:'none', background:'transparent', padding:'5px', width:'100%', outline:'none', fontSize:'0.95rem'}}
             />
             {filterQuery && (
               <button 
                onClick={() => setFilterQuery('')} 
                style={{background:'transparent', border:'none', color:'#999', cursor:'pointer', padding:0, width:'auto', fontSize:'1rem'}}
               >
                 ×
               </button>
             )}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="swimlane-board">
            
            <div className="swimlane-header">
              <div className="swimlane-corner"></div> 
              {columnsToRender.map(col => (
                <div key={col.id} className="swimlane-col-header" style={{borderTop: `4px solid ${col.color}`}}>
                  {col.title} <span style={{fontWeight:'normal', fontSize:'0.8em', marginLeft:'5px'}}>
                    ({filteredTasks.filter(t => t.status === col.id).length})
                  </span>
                </div>
              ))}
            </div>

            {rowsToRender.map(row => (
              <div key={row.id} className="swimlane-row">
                <div className="swimlane-row-header">
                  <h3>{row.title}</h3>
                  <div className="quick-add">
                    <input 
                      type="text" placeholder="+ Tarea..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.target.value.trim()) { 
                             handleCreateTask(row.id, e.target.value);
                             e.target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {columnsToRender.map(col => {
                  const dropId = `${row.id}::${col.id}`;
                  
                  const cellTasks = filteredTasks.filter(t => 
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
                          {cellTasks.map((task, index) => {
                            const completedChecks = task.checklist?.filter(c => c.done).length || 0;
                            const totalChecks = task.checklist?.length || 0;
                            const progress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

                            return (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided) => (
                                  <div 
                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                    className="kanban-card"
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    {editingId === task._id ? (
                                      <div className="edit-mode" onClick={(e)=>e.stopPropagation()}>
                                        <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                                        <div className="edit-actions">
                                          <button onClick={() => saveEdit(task._id)} className="save-btn">✔</button>
                                          <button onClick={(e) => {e.stopPropagation(); setEditingId(null);}} className="cancel-btn">✖</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{width:'100%'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                                          <p style={{fontWeight:'bold', marginBottom:'5px'}}>{task.title}</p>
                                          
                                          <div className="card-actions">
                                            <button onClick={(e) => startEditing(e, task)} className="edit-btn" title="Editar"><FaEdit /></button>
                                            <button onClick={(e) => handleDelete(e, task._id)} className="delete-btn" title="Borrar"><FaTrash /></button>
                                          </div>
                                        </div>
                                        
                                        {totalChecks > 0 && (
                                          <div style={{marginTop:'8px'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.7rem', color:'#666', marginBottom:'2px'}}>
                                              <FaCheckSquare /> {completedChecks}/{totalChecks}
                                            </div>
                                            <div style={{width:'100%', height:'4px', background:'#eee', borderRadius:'2px', overflow:'hidden'}}>
                                              <div style={{width:`${progress}%`, background: progress===100?'#00b894':'#0984e3', height:'100%', transition:'width 0.3s'}}></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
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

      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', alignItems:'flex-start'}}>
              <h3 style={{margin:0, textAlign:'left', paddingRight:'20px'}}>{selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} style={{background:'transparent', color:'#333', fontSize:'1.5rem', padding:0, border:'none', cursor:'pointer'}}>×</button>
            </div>
            
            {selectedTask.description && (
               <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'5px', marginBottom:'20px', fontSize:'0.9rem', color:'#555'}}>
                 {selectedTask.description}
               </div>
            )}

            <h4 style={{borderBottom:'1px solid #eee', paddingBottom:'5px', marginBottom:'15px', color:'#2d3436'}}>
              <FaCheckSquare /> Checklist
            </h4>
            
            <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px', maxHeight:'300px', overflowY:'auto'}}>
              {selectedTask.checklist?.map((item, idx) => (
                <div key={idx} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', background:'white', borderRadius:'5px', border:'1px solid #eee'}}>
                  <input 
                    type="checkbox" 
                    checked={item.done} 
                    onChange={() => handleToggleCheckItem(idx)}
                    style={{width:'18px', height:'18px', cursor:'pointer'}} 
                  />
                  <span style={{flex:1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#aaa' : '#333'}}>
                    {item.text}
                  </span>
                  <button onClick={() => handleDeleteCheckItem(idx)} style={{background:'transparent', color:'#ff7675', padding:'5px', width:'auto', border:'none', cursor:'pointer'}}>
                    <FaTrash size={14}/>
                  </button>
                </div>
              ))}
            </div>

            <div style={{display:'flex', gap:'8px'}}>
              <input 
                type="text" placeholder="Agregar nueva tarea..." 
                value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCheckItem()}
                style={{flex:1, padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}
              />
              <button onClick={handleAddCheckItem} style={{width:'auto', background:'#0984e3', color:'white', border:'none', borderRadius:'5px', padding:'0 15px', cursor:'pointer'}}>
                <FaPlus />
              </button>
            </div>
            <div style={{marginTop:'25px', textAlign:'right', borderTop:'1px solid #eee', paddingTop:'15px'}}>
              <button onClick={() => setSelectedTask(null)} style={{background:'#636e72', color:'white', border:'none', padding:'8px 20px', borderRadius:'5px', cursor:'pointer'}}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tablero;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { API_URL } from '../config';

function TableroCotizaciones() {
  const [quotes, setQuotes] = useState([]);

  const columns = {
    '0-PENDIENTE DE ENVIO': { title: "Pendiente", color: "#e17055" }, 
    '1-ESPERA RESPUESTA CLIENTE': { title: "Enviada", color: "#00cec9" }, 
    '2-ADJUDICADO': { title: "Adjudicado", color: "#0984e3" }, 
    '3-PERDIDO': { title: "Perdido", color: "#d63031" } 
  };

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(res.data);
    } catch (error) { console.error("Error cargando presupuestos:", error); }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;

    const updatedQuotes = quotes.map(q => 
      q._id === draggableId ? { ...q, status: newStatus } : q
    );
    setQuotes(updatedQuotes);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/quotes/${draggableId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (newStatus === '2-ADJUDICADO') {
        fetchQuotes();
        alert("¡Presupuesto Adjudicado! Se ha generado el Proyecto y la Tarea operativa.");
      }

    } catch (error) {
      console.error("Error al mover:", error);
      fetchQuotes(); 
      alert("Error al actualizar el estado");
    }
  };

  const fMoney = (amount) => amount ? `${Number(amount).toFixed(2)} UF` : '0 UF';

  return (
    <div className="app-container">
      <div className="page-header">
        <h2>Tablero Comercial (Presupuestos)</h2>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.entries(columns).map(([columnId, columnData]) => (
            <div key={columnId} className="kanban-column">
              <h2 style={{ borderBottom: `4px solid ${columnData.color}` }}>
                {columnData.title} <span style={{fontSize:'0.8em', color:'#666'}}>({quotes.filter(q => q.status === columnId).length})</span>
              </h2>

              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="column-content">
                    {quotes
                      .filter(quote => quote.status === columnId)
                      .map((quote, index) => (
                        <Draggable key={quote._id} draggableId={quote._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="kanban-card"
                              style={{
                                ...provided.draggableProps.style,
                                borderLeft: `4px solid ${columnData.color}`,
                                flexDirection: 'column', 
                                gap: '5px'
                              }}
                            >
                              <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                                <span style={{fontWeight:'bold', fontSize:'0.9rem', color:'#2d3436'}}>
                                  {quote.clientName}
                                </span>
                                {quote.projectCode && (
                                  <span style={{background:'#0984e3', color:'white', padding:'2px 6px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>
                                    {quote.projectCode}
                                  </span>
                                )}
                              </div>
                              
                              <p style={{fontSize:'0.85rem', color:'#636e72', margin:0}}>
                                {quote.description}
                              </p>
                              
                              <div style={{display:'flex', justifyContent:'space-between', width:'100%', marginTop:'5px', borderTop:'1px solid #eee', paddingTop:'5px'}}>
                                <span style={{fontWeight:'bold', color:'#2d3436'}}>
                                  {fMoney(Number(quote.netoUF || 0) * 1.19)}
                                </span>
                                <span style={{fontSize:'0.8rem', color:'#b2bec3'}}>
                                  {new Date(quote.createdAt).toLocaleDateString()}
                                </span>
                              </div>
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
  );
}

export default TableroCotizaciones;
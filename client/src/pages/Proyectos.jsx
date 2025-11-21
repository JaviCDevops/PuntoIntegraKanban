import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ModalPagos from '../components/ModalPagos';

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchProyectos(); }, []);

  const fetchProyectos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const soloAdjudicados = res.data.filter(q => q.projectCode);
      setProyectos(soloAdjudicados);
    } catch (error) { console.error(error); }
  };

  const openModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>🏗️ Proyectos en Curso</h2>

      {proyectos.length === 0 ? (
        <p style={{textAlign: 'center', color: '#636e72'}}>No hay proyectos adjudicados aún.</p>
      ) : (
        <div className="table-wrapper">
          <table className="project-table">
            <thead>
              <tr>
                <th>Cód. Proyecto</th>
                <th>Cliente</th>
                <th>Detalle</th>
                <th>Estado Pago</th>
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map(proj => {
                const totalPagos = proj.payments?.length || 0;
                const pagados = proj.payments?.filter(p => p.status === 'PAGADO').length || 0;
                
                return (
                  <tr key={proj._id} style={{borderLeft: '5px solid #0984e3'}}>
                    <td className="project-code">{proj.projectCode}</td>
                    <td>{proj.clientName}</td>
                    <td>{proj.description}</td>
                    
                    <td>
                      {totalPagos > 0 ? (
                        <span style={{fontSize:'0.9rem', color: pagados === totalPagos ? 'green' : 'orange', fontWeight:'bold'}}>
                          {pagados}/{totalPagos} Cuotas Pagadas
                        </span>
                      ) : (
                        <span style={{color: '#999', fontSize:'0.8rem'}}>Sin configurar</span>
                      )}
                    </td>
                    
                    <td>
                      <button 
                        onClick={() => openModal(proj)}
                        style={{
                          background: '#6c5ce7', color: 'white', 
                          border: 'none', padding: '8px 12px', 
                          borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                      >
                        💰 Gestionar Pagos
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedProject && (
        <ModalPagos 
          project={selectedProject} 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={fetchProyectos}
        />
      )}
    </div>
  );
}

export default Proyectos;
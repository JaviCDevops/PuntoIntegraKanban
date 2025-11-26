import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaProjectDiagram, FaMoneyBillWave } from 'react-icons/fa';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUF: 0,
    totalCLP: 0
  });
  
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/quotes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        calculateStats(res.data);
      } catch (error) { console.error("Error datos dashboard", error); }
    };
    fetchData();
  }, []);

  const calculateStats = (data) => {
    let totalUF = 0;
    let totalCLP = 0;
    
    let countPendiente = 0;
    let countEnviada = 0;
    let countAdjudicada = 0;
    let countPerdida = 0;

    data.forEach(p => {
      if (p.status !== '3-PERDIDO') {
          totalUF += Number(p.netoUF || 0);
          totalCLP += Number(p.netoCLP || 0);
      }

      switch (p.status) {
        case '0-PENDIENTE DE ENVIO':
          countPendiente++;
          break;
        case '1-ESPERA RESPUESTA CLIENTE':
          countEnviada++;
          break;
        case '2-ADJUDICADO':
          countAdjudicada++;
          break;
        case '3-PERDIDO':
          countPerdida++;
          break;
        default:
          countPendiente++; 
      }
    });

    setStats({
      totalProjects: data.length,
      totalUF: totalUF.toFixed(2),
      totalCLP: totalCLP
    });

    const chartData = [
      { name: 'Pendiente', value: countPendiente, color: '#e17055' }, 
      { name: 'Enviada', value: countEnviada, color: '#00cec9' },     
      { name: 'Adjudicada', value: countAdjudicada, color: '#0984e3' }, 
      { name: 'Perdida', value: countPerdida, color: '#d63031' }      
    ].filter(item => item.value > 0); 

    setStatusData(chartData);
  };

  const fCLP = (n) => '$ ' + Number(n).toLocaleString('es-CL');

  return (
    <div className="app-container">
      <div className="page-header">
        <h2>📊 Estado de Cotizaciones</h2>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><FaProjectDiagram /></div>
          <div className="kpi-info">
            <h3>{stats.totalProjects}</h3>
            <p>Total Presupuestos</p>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon"><FaMoneyBillWave /></div>
          <div className="kpi-info">
            <h3>{stats.totalUF} UF</h3>
            <p style={{fontSize: '0.8rem', marginTop:'5px'}}>({fCLP(stats.totalCLP)})</p>
            <p>Monto Potencial (Activo)</p>
          </div>
        </div>
      </div>

      <div className="chart-box" style={{marginTop: '30px', padding: '30px'}}>
        <h3 style={{textAlign:'center', marginBottom:'20px'}}>Distribución de Presupuestos</h3>
        
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={80} 
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`} 
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {statusData.length === 0 && (
          <p style={{textAlign:'center', color:'#999'}}>No hay datos para mostrar.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Tablero from './pages/Tablero';
import Cotizaciones from './pages/Cotizaciones';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav style={{ display: 'flex', gap: '20px', padding: '20px', background: '#dfe6e9', marginBottom: '20px', borderRadius: '8px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}> Tablero Kanban</Link>
            <Link to="/cotizaciones" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}> Cotizaciones</Link>        </nav>

        <Routes>
            <Route path="/" element={<Tablero />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
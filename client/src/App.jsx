import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { 
  FaSignOutAlt, 
} from "react-icons/fa";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 
import BoardList from "./pages/BoardList"; 
import CreateBoard from "./pages/CreateBoard";
import Tablero from "./pages/Tablero";     

import Cotizaciones from "./pages/Cotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import TableroCotizaciones from "./pages/TableroCotizaciones"; 

import Proyectos from "./pages/Proyectos"; 

import Clientes from "./pages/Clientes";
import CrearCliente from "./pages/CrearCliente";

import AdminPanel from "./pages/AdminPanel"; 
import UsersList from "./pages/UsersList"; 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user.role !== 'admin') {
    return (
      <div style={{padding: 50, textAlign: 'center', color: '#636e72'}}>
        <h3>Acceso Restringido</h3>
        <p>Se requieren permisos de Administrador para ver esta sección.</p>
        <Link to="/" style={{color:'#0984e3'}}>Volver al inicio</Link>
      </div>
    );
  }
  return children;
};

const NavBar = () => {
  const { user, logout, isAdmin } = useAuth();
  if (!user) return null;

  const can = (perm) => user.role === 'admin' || (user.permissions && user.permissions.includes(perm));

  const linkStyle = { 
    textDecoration: 'none', 
    color: '#333', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontWeight: '500',
    fontSize: '0.95rem'
  };

  return (
    <nav>
      <div style={{marginRight: 'auto', display: 'flex', flexDirection: 'column'}}> 
        <span style={{fontSize: '1.2rem', fontWeight:'800', color: '#2d3436', letterSpacing:'-0.5px'}}>Punto Integra</span>
        <span style={{fontSize:'0.75em', color: '#636e72'}}>{user.username} ({user.role})</span>
      </div>
      
      <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      <Link to="/boards" style={linkStyle}>Tableros</Link>
      {can('access_quotes') && (
        <>
          <Link to="/cotizaciones" style={linkStyle}>Presupuestos</Link>
          <Link to="/pipeline" style={linkStyle}></Link>
        </>
      )}
      
      {can('access_projects') && <Link to="/proyectos" style={linkStyle}>Proyectos</Link>}
      {can('access_clients') && <Link to="/clientes" style={linkStyle}> Clientes</Link>}
      
      {isAdmin && (
        <div style={{display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '2px solid #eee', marginLeft:'10px'}}>
          <Link to="/admin/users" style={{...linkStyle, color: '#6c5ce7'}}> Usuarios</Link>
        </div>
      )}

      <button 
        onClick={logout} 
        style={{
          background: '#ff7675', color: 'white', padding: '8px 16px', border: 'none', 
          borderRadius: '6px', cursor: 'pointer', marginLeft: '15px', display: 'flex', 
          alignItems: 'center', gap: '6px', fontSize:'0.9rem'
        }}
      >
        <FaSignOutAlt /> Salir
      </button>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <NavBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/boards" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
            <Route path="/boards/create" element={<AdminRoute><CreateBoard /></AdminRoute>} />
            <Route path="/boards/edit/:id" element={<AdminRoute><CreateBoard /></AdminRoute>} />
            <Route path="/board/:id" element={<ProtectedRoute><Tablero /></ProtectedRoute>} />
            
            <Route path="/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>} />
            <Route path="/cotizaciones/crear" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
            <Route path="/cotizaciones/editar/:id" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><TableroCotizaciones /></ProtectedRoute>} /> 
            
            <Route path="/proyectos" element={<ProtectedRoute><Proyectos /></ProtectedRoute>} />
            <Route path="/proyectos/editar/:id" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
            
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/clientes/crear" element={<ProtectedRoute><CrearCliente /></ProtectedRoute>} />
            <Route path="/clientes/editar/:id" element={<ProtectedRoute><CrearCliente /></ProtectedRoute>} />

            <Route path="/admin/create" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/users/edit/:id" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />

          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
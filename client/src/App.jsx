import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import UsersList from "./pages/UsersList"; 
import Tablero from "./pages/Tablero"; 
import Cotizaciones from "./pages/Cotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import Proyectos from "./pages/Proyectos";
import Clientes from "./pages/Clientes";
import CrearCliente from "./pages/CrearCliente";
import BoardList from "./pages/BoardList";
import CreateBoard from "./pages/CreateBoard";
import TableroCotizaciones from "./pages/TableroCotizaciones.jsx"; 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <div style={{padding: 20, textAlign: 'center'}}>⛔ Acceso Denegado</div>;
  return children;
};

const NavBar = () => {
  const { user, logout, isAdmin } = useAuth();
  if (!user) return null;
  const can = (perm) => user.role === 'admin' || (user.permissions && user.permissions.includes(perm));

  return (
    <nav style={{display: 'flex', gap: '15px', padding: '15px', background: '#dfe6e9', alignItems: 'center', flexWrap: 'wrap'}}>
      <span style={{marginRight: 'auto', fontWeight: 'bold', color: '#2d3436'}}> 
        {user.username} <span style={{fontSize:'0.8em', fontWeight:'normal'}}>({user.role})</span>
      </span>
      
      <Link to="/boards" style={{ textDecoration: 'none', color: '#333' }}>📋 Mis Tableros</Link>

      {can('access_quotes') && (
        <>
          <Link to="/cotizaciones" style={{textDecoration:'none', color:'#333'}}>💰 Lista Presupuestos</Link>
          <Link to="/pipeline" style={{textDecoration:'none', color:'#333', fontWeight:'bold'}}>📊 Pipeline Ventas</Link>
        </>
      )}
      
      {can('access_projects') && <Link to="/proyectos" style={{textDecoration:'none', color:'#333'}}>🏗️ Proyectos</Link>}
      {can('access_clients') && <Link to="/clientes" style={{textDecoration:'none', color:'#333'}}>🤝 Clientes</Link>}
      
      {isAdmin && (
        <>
          <div style={{borderLeft: '2px solid #999', height: '20px', margin: '0 5px'}}></div>
          <Link to="/admin/users" style={{ textDecoration: 'none', color: '#6c5ce7', fontWeight: 'bold' }}>👥 Usuarios</Link>
          <Link to="/admin/create" style={{ textDecoration: 'none', color: '#d63031', fontWeight: 'bold' }}>👑 Crear Usuario</Link>
        </>
      )}

      <button onClick={logout} style={{background: '#636e72', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px'}}>
        Salir
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
            <Route path="/" element={<Navigate to="/boards" replace />} />
            
            {/* TABLEROS */}
            <Route path="/boards" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
            <Route path="/boards/create" element={<AdminRoute><CreateBoard /></AdminRoute>} />
            <Route path="/boards/edit/:id" element={<AdminRoute><CreateBoard /></AdminRoute>} />
            <Route path="/board/:id" element={<ProtectedRoute><Tablero /></ProtectedRoute>} />
            
            {/* NEGOCIO */}
            <Route path="/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>} />
            <Route path="/cotizaciones/crear" element={<ProtectedRoute><CrearCotizacion /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><TableroCotizaciones /></ProtectedRoute>} /> 
            
            <Route path="/proyectos" element={<ProtectedRoute><Proyectos /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/clientes/crear" element={<ProtectedRoute><CrearCliente /></ProtectedRoute>} />
            <Route path="/clientes/editar/:id" element={<ProtectedRoute><CrearCliente /></ProtectedRoute>} />

            {/* ADMIN */}
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
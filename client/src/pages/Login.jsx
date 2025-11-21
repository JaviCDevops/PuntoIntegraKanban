import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llamamos al backend para loguear
      // NOTA: Usamos /auth/login que definimos en el server
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Si sale bien, guardamos en el contexto
      login(res.data.user, res.data.token);
      navigate('/'); // Ir al inicio
    } catch (error) {
      alert(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  // Estilos simples en línea para el login
  const containerStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', height: '80vh'
  };
  const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '15px', 
    width: '300px', padding: '30px', background: 'white', borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{color: '#2d3436'}}>Punto Integra ERP</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{textAlign: 'center', color: '#2d3436', margin: 0}}>Iniciar Sesión</h3>
        <input 
          type="email" placeholder="Correo electrónico" required 
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
        />
        <input 
          type="password" placeholder="Contraseña" required 
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
        />
        <button type="submit" style={{
          padding: '10px', background: '#0984e3', color: 'white', border: 'none', 
          borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;
import React, { useState } from 'react';
import Login from './Login';
import TipoPersonaCRUD from './TipoPersonaCRUD'; 
import './App.css'; // Asegúrate de que esta línea esté para cargar los estilos

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    if (userData) {
      setUser(userData);
      console.log("Sesión iniciada para:", userData.NOMBREUSUARIO || userData.nombreUsuario);
    } else {
      console.error("No se recibieron datos del usuario");
    }
  };

  return (
    <div className="App">
      {/* Agregamos el div 'container' para que el CSS 
          ponga el fondo blanco y las sombras 
      */}
      <div className="container"> 
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
            <h1>Bienvenido al Sistema Inmobiliario</h1>
            
            <p style={{ color: 'black' }}>
              Usuario: <strong>{user.NOMBREUSUARIO}</strong>
            </p>
            
            <hr />
            
            <h3>Módulo: Gestión de Tipo Persona</h3>
            
            {/* El CRUD ahora heredará los estilos del contenedor */}
            <TipoPersonaCRUD />
            
            <button 
              onClick={() => setUser(null)} 
              style={{ marginTop: '20px', backgroundColor: '#6c757d', color: 'white' }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
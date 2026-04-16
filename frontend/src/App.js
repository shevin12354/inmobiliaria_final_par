import React, { useState } from 'react';
import Login from './components/Login.jsx';
import TipoPersonaCRUD from './components/TipoPersonaCRUD.jsx';
import PersonaCRUD from './components/PersonaCRUD.jsx';
import EmpleadoCRUD from './components/EmpleadoCRUD';
import ClienteCRUD from './components/ClienteCRUD'; // 1. Importar el nuevo componente
import PropietarioCRUD from './components/PropietarioCRUD';
import UbicacionesCRUD from './components/UbicacionesCRUD.jsx';
import Contratos from './components/Contratos.jsx';

import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [vista, setVista] = useState('inicio');

  const handleLoginSuccess = (userData) => {
    if (userData) setUser(userData);
  };

  

  return (
    <div className="App">
      <div className="container">
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
            <h1>Sistema Inmobiliario</h1>
            <p>Usuario: <strong>{user.NOMBREUSUARIO}</strong></p>
            
            {/* --- MENÚ DE NAVEGACIÓN --- */}
            <nav style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-nav" onClick={() => setVista('inicio')}>Inicio</button>
              <button className="btn-nav" onClick={() => setVista('tipos')}>Tipos Persona</button>
              <button className="btn-nav" onClick={() => setVista('personas')}>Personas</button>
              <button className="btn-nav" onClick={() => setVista('empleados')}>Empleados</button>
              {/* 2. Botón para el módulo de Clientes */}
              <button className="btn-nav" onClick={() => setVista('clientes')}>Clientes</button>
              <button className="btn-nav" onClick={() => setVista('propietarios')}>Propietarios</button>
              <button className="btn-nav" onClick={() => setVista('ubicaciones')}>Ubicaciones</button>
              <button className="btn-nav" onClick={() => setVista('contratos')}>Contratos</button>

            </nav>
            <hr />

            {/* --- RENDERIZADO CONDICIONAL --- */}
            {vista === 'inicio' && <h2>Bienvenido, selecciona un módulo</h2>}
            {vista === 'tipos' && <TipoPersonaCRUD />}
            {vista === 'personas' && <PersonaCRUD />}
            {vista === 'empleados' && <EmpleadoCRUD />}
            {/* 3. Mostrar el CRUD de Clientes cuando la vista sea 'clientes' */}
            {vista === 'clientes' && <ClienteCRUD />}
            {vista === 'propietarios' && <PropietarioCRUD />}
            {vista === 'ubicaciones' && <UbicacionesCRUD />}
            {vista === 'contratos' && <Contratos />}
            
            <button onClick={() => setUser(null)} style={{ marginTop: '30px', backgroundColor: '#6c757d', color: 'white' }}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
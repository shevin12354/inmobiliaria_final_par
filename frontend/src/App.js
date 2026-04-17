import React, { useState } from 'react';
import Login from './components/Login.jsx';
import TipoPersonaCRUD from './components/TipoPersonaCRUD.jsx';
import PersonaCRUD from './components/PersonaCRUD.jsx';
import EmpleadoCRUD from './components/EmpleadoCRUD';
import ClienteCRUD from './components/ClienteCRUD';
import PropietarioCRUD from './components/PropietarioCRUD';
import UbicacionesCRUD from './components/UbicacionesCRUD.jsx';
import Contratos from './components/Contratos.jsx';
import Dashboard from './components/Dashboard';

import './styles/App.css';
import './styles/index.css';


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
          <div className="dashboard-layout">

            {/* ===== SIDEBAR ===== */}
            <aside className="sidebar">
              <h2 className="logo">🏢 Inmobiliaria</h2>

              <p className="user">
                Usuario: <strong>{user.NOMBREUSUARIO}</strong>
              </p>

              <nav>
                <button onClick={() => setVista('inicio')}>Inicio</button>

                <button onClick={() => setVista('tipos')}>Tipos Persona</button>
                <button onClick={() => setVista('personas')}>Personas</button>
                <button onClick={() => setVista('empleados')}>Empleados</button>
                <button onClick={() => setVista('clientes')}>Clientes</button>
                <button onClick={() => setVista('propietarios')}>Propietarios</button>

                <button onClick={() => setVista('ubicaciones')}>Ubicaciones</button>
                <button onClick={() => setVista('contratos')}>Contratos</button>
              </nav>

              <button
                className="logout"
                onClick={() => setUser(null)}
              >
                Cerrar Sesión
              </button>
            </aside>


            {/* ===== CONTENIDO ===== */}
            <div className="main-panel">

              <header className="topbar">
                <h1>Sistema Inmobiliario</h1>
              </header>

              <div className="content">

                {vista === 'inicio' && <Dashboard />}
                {vista === 'tipos' && <TipoPersonaCRUD />}
                {vista === 'personas' && <PersonaCRUD />}
                {vista === 'empleados' && <EmpleadoCRUD />}
                {vista === 'clientes' && <ClienteCRUD />}
                {vista === 'propietarios' && <PropietarioCRUD />}
                {vista === 'ubicaciones' && <UbicacionesCRUD />}
                {vista === 'contratos' && <Contratos />}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
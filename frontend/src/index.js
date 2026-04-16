import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // 👈 CAMBIO 1: Agregamos /styles/
import App from './App';

// Como vamos a limpiar el proyecto para el profe, 
// borramos la referencia a reportWebVitals que no usaremos.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
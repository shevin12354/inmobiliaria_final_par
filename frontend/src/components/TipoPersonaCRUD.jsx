import React, { useState, useEffect } from 'react';

const TipoPersonaCRUD = () => {
  const [tipos, setTipos] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  const cargarTipos = () => {
    fetch('http://localhost:5000/tipopersona')
      .then(res => res.json())
      .then(data => {
        console.log("Datos cargados:", data);
        setTipos(data);
      })
      .catch(err => console.error("Error al cargar:", err));
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  // --- 1. CREAR ---
  const crearTipo = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (!nuevaDescripcion) return alert("Escribe una descripción");

    try {
      const res = await fetch('http://localhost:5000/tipopersona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevaDescripcion })
      });

      if (res.ok) {
        setNuevaDescripcion(""); // Limpia el cuadro de texto
        cargarTipos(); // Refresca la tabla automáticamente
      }
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };

  // --- 2. EDITAR (La pieza que faltaba) ---
  const editarTipo = async (id) => {
    const descActualizada = prompt("Ingrese la nueva descripción:");
    if (!descActualizada) return;

    try {
      const res = await fetch(`http://localhost:5000/tipopersona/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: descActualizada })
      });

      if (res.ok) {
        cargarTipos();
      } else {
        alert("No se pudo actualizar");
      }
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  // --- 3. ELIMINAR ---
  const eliminarTipo = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        const res = await fetch(`http://localhost:5000/tipopersona/${id}`, { 
          method: 'DELETE' 
        });
        
        if (res.ok) {
          cargarTipos();
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3 style={{ color: 'black' }}>Gestión de Tipos de Persona</h3>

      {/* FORMULARIO PARA CREAR */}
      <form onSubmit={crearTipo} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Ej: Proveedor, Cliente..." 
          value={nuevaDescripcion}
          onChange={(e) => setNuevaDescripcion(e.target.value)}
          style={{ padding: '8px', width: '250px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Agregar Nuevo
        </button>
      </form>

      {/* TABLA DE LECTURA */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', color: 'black' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.IDTIPOPERSONA}>
              <td style={{ padding: '8px', textAlign: 'center' }}>{t.IDTIPOPERSONA}</td>
              <td style={{ padding: '8px' }}>{t.DESCRIPCION}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {/* BOTÓN EDITAR */}
                <button 
                  onClick={() => editarTipo(t.IDTIPOPERSONA)} 
                  style={{ marginRight: '10px', cursor: 'pointer', border: '1px solid #007bff', color: '#007bff', background: 'none', padding: '4px 8px', borderRadius: '4px' }}
                >
                  ✏️ Editar
                </button>
                {/* BOTÓN ELIMINAR */}
                <button 
                  onClick={() => eliminarTipo(t.IDTIPOPERSONA)} 
                  style={{ color: 'red', border: '1px solid red', background: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TipoPersonaCRUD;
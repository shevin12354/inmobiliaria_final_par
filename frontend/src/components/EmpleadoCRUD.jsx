import React, { useState, useEffect } from 'react';

const EmpleadoCRUD = () => {
    const [empleados, setEmpleados] = useState([]);
    const [idPersona, setIdPersona] = useState('');
    const [editando, setEditando] = useState(false);
    const [idEmpleadoEditar, setIdEmpleadoEditar] = useState(null);

    // Cargar empleados con JOIN para ver el nombre de la persona
    const cargarEmpleados = async () => {
        try {
            const res = await fetch('http://localhost:5000/empleado');
            const data = await res.json();
            setEmpleados(data);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };

    useEffect(() => { cargarEmpleados(); }, []);

    const prepararEdicion = (emp) => {
        setEditando(true);
        setIdEmpleadoEditar(emp.IDEMPLEADO);
        setIdPersona(emp.IDPERSONA);
    };

    const eliminarEmpleado = async (id) => {
        if (window.confirm("¿Deseas eliminar este registro de empleado?")) {
            await fetch(`http://localhost:5000/empleado/${id}`, { method: 'DELETE' });
            cargarEmpleados();
        }
    };

 const guardarEmpleado = async (e) => {
    e.preventDefault();

    // 1. DEFINIMOS LAS VARIABLES (Esto era lo que faltaba)
    const url = editando 
        ? `http://localhost:5000/empleado/${idEmpleadoEditar}` 
        : 'http://localhost:5000/empleado';
    
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPersona })
        });

        // 2. CAPTURAMOS EL TEXTO QUE MANDA EL BACKEND
        const respuestaTexto = await res.text();

        if (res.ok) {
            alert(respuestaTexto); // "Empleado registrado con éxito"
            setEditando(false);
            setIdEmpleadoEditar(null);
            setIdPersona('');
            cargarEmpleados();
        } else {
            // 3. AQUÍ SE MUESTRA EL MENSAJE DE "EL ID NO EXISTE" QUE MANDAMOS DESDE EL BACKEND
            alert("⚠️ " + respuestaTexto);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
    }
};
    return (
        <div>
            <h3>Gestión de Empleados</h3>
            <form onSubmit={guardarEmpleado} className="grid-form">
                <input 
                    type="number"
                    name="idPersona" 
                    value={idPersona} 
                    placeholder="ID de Persona (FK)" 
                    onChange={(e) => setIdPersona(e.target.value)} 
                    required 
                />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        type="submit" 
                        className={editando ? "btn-update" : "btn-add"}
                        style={{ flex: 1, backgroundColor: editando ? '#2196F3' : '#28a745' }}
                    >
                        {editando ? "Actualizar Empleado" : "Vincular como Empleado"}
                    </button>

                    {editando && (
                        <button 
                            type="button" 
                            onClick={() => {
                                setEditando(false);
                                setIdPersona('');
                            }}
                            style={{ backgroundColor: '#6c757d' }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID Empleado</th>
                        <th>ID Persona</th>
                        <th>Nombre (Desde Persona)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((emp) => (
                        <tr key={emp.IDEMPLEADO}>
                            <td style={{ fontWeight: 'bold' }}>{emp.IDEMPLEADO}</td>
                            <td>{emp.IDPERSONA}</td>
                            {/* Estos campos vienen del JOIN en el backend */}
                            <td>{emp.NOMBRE} {emp.APELLIDO}</td>
                            <td>
                                <button className="btn-edit" onClick={() => prepararEdicion(emp)}>✏️</button>
                                <button className="btn-delete" onClick={() => eliminarEmpleado(emp.IDEMPLEADO)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmpleadoCRUD;
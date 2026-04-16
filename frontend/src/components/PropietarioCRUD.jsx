import React, { useState, useEffect } from 'react';


const PropietarioCRUD = () => {
    const [propietarios, setPropietarios] = useState([]);
    const [idPersona, setIdPersona] = useState('');
    const [editando, setEditando] = useState(false);
    const [idPropietarioEditar, setIdPropietarioEditar] = useState(null);

    // Cargar propietarios con JOIN para ver el nombre de la persona vinculada
    const cargarPropietarios = async () => {
        try {
            const res = await fetch('http://localhost:5000/propietario');
            const data = await res.json();
            setPropietarios(data);
        } catch (error) {
            console.error("Error al cargar propietarios:", error);
        }
    };

    useEffect(() => { cargarPropietarios(); }, []);

    const prepararEdicion = (pro) => {
        setEditando(true);
        // Usamos IDPROPIETARIO e IDPERSONA (en mayúsculas por Oracle)
        setIdPropietarioEditar(pro.IDPROPIETARIO);
        setIdPersona(pro.IDPERSONA);
    };

    const eliminarPropietario = async (id) => {
        if (window.confirm("¿Deseas eliminar este registro de propietario?")) {
            await fetch(`http://localhost:5000/propietario/${id}`, { method: 'DELETE' });
            cargarPropietarios();
        }
    };

    const guardarPropietario = async (e) => {
        e.preventDefault();
        const url = editando 
            ? `http://localhost:5000/propietario/${idPropietarioEditar}` 
            : 'http://localhost:5000/propietario';
        const metodo = editando ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPersona })
            });

            const mensaje = await res.text();

            if (res.ok) {
                alert(mensaje);
                setEditando(false);
                setIdPropietarioEditar(null);
                setIdPersona('');
                cargarPropietarios();
            } else {
                alert("⚠️ " + mensaje); 
            }
        } catch (error) {
            console.error("Error al guardar propietario:", error);
            alert("No se pudo conectar con el servidor.");
        }
    };

    return (
        <div>
            <h3>Gestión de Propietarios</h3>
            <form onSubmit={guardarPropietario} className="grid-form">
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
                        style={{ flex: 1, backgroundColor: editando ? '#2196F3' : '#28a745', color: 'white' }}
                    >
                        {editando ? "Actualizar Propietario" : "Registrar Propietario"}
                    </button>

                    {editando && (
                        <button 
                            type="button" 
                            onClick={() => {
                                setEditando(false);
                                setIdPersona('');
                            }}
                            style={{ backgroundColor: '#6c757d', color: 'white' }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID Propietario</th>
                        <th>ID Persona</th>
                        <th>Nombre Completo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {propietarios.map((pro) => (
                        <tr key={pro.IDPROPIETARIO}>
                            <td style={{ fontWeight: 'bold' }}>{pro.IDPROPIETARIO}</td>
                            <td>{pro.IDPERSONA}</td>
                            <td>{pro.NOMBRE} {pro.APELLIDO}</td>
                            <td>
                                <button className="btn-edit" onClick={() => prepararEdicion(pro)}>✏️</button>
                                <button className="btn-delete" onClick={() => eliminarPropietario(pro.IDPROPIETARIO)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PropietarioCRUD;
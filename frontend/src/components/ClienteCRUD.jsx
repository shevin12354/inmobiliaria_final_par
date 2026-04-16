import React, { useState, useEffect } from 'react';

const ClienteCRUD = () => {
    const [clientes, setClientes] = useState([]);
    const [idPersona, setIdPersona] = useState('');
    const [editando, setEditando] = useState(false);
    const [idClienteEditar, setIdClienteEditar] = useState(null);

    // Cargar clientes con JOIN para ver el nombre de la persona vinculada
    const cargarClientes = async () => {
        try {
            const res = await fetch('http://localhost:5000/cliente');
            const data = await res.json();
            setClientes(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    const prepararEdicion = (cli) => {
        setEditando(true);
        // Usamos IDCLIENTE e IDPERSONA (en mayúsculas por el outFormat de Oracle)
        setIdClienteEditar(cli.IDCLIENTE);
        setIdPersona(cli.IDPERSONA);
    };

    const eliminarCliente = async (id) => {
        if (window.confirm("¿Deseas eliminar este registro de cliente?")) {
            await fetch(`http://localhost:5000/cliente/${id}`, { method: 'DELETE' });
            cargarClientes();
        }
    };

    const guardarCliente = async (e) => {
    e.preventDefault();
    const url = editando 
        ? `http://localhost:5000/cliente/${idClienteEditar}` 
        : 'http://localhost:5000/cliente';
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPersona })
        });

        const mensaje = await res.text(); // Leemos la respuesta del servidor

        if (res.ok) {
            alert(mensaje); // "Cliente registrado con éxito"
            setEditando(false);
            setIdClienteEditar(null);
            setIdPersona('');
            cargarClientes();
        } else {
            // Aquí se mostrará el "Error: El ID de Persona no existe..."
            alert(mensaje); 
        }
    } catch (error) {
        console.error("Error al guardar cliente:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

    return (
        <div>
            <h3>Gestión de Clientes</h3>
            <form onSubmit={guardarCliente} className="grid-form">
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
                        {editando ? "Actualizar Cliente" : "Registrar Cliente"}
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
                        <th>ID Cliente</th>
                        <th>ID Persona</th>
                        <th>Nombre Completo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((cli) => (
                        <tr key={cli.IDCLIENTE}>
                            <td style={{ fontWeight: 'bold' }}>{cli.IDCLIENTE}</td>
                            <td>{cli.IDPERSONA}</td>
                            {/* NOMBRE y APELLIDO vienen del JOIN en el Backend */}
                            <td>{cli.NOMBRE} {cli.APELLIDO}</td>
                            <td>
                                <button className="btn-edit" onClick={() => prepararEdicion(cli)}>✏️</button>
                                <button className="btn-delete" onClick={() => eliminarCliente(cli.IDCLIENTE)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClienteCRUD;
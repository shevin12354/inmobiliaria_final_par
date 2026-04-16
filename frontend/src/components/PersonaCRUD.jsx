import React, { useState, useEffect } from 'react';

const PersonaCRUD = () => {
    const [personas, setPersonas] = useState([]);
    const [form, setForm] = useState({
        idTipoPersona: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        domicilio: '',
        telefono: '',
        correo: ''
    });

    const [editando, setEditando] = useState(false);
const [idEditar, setIdEditar] = useState(null);

// Función para preparar el formulario con los datos de la fila
const prepararEdicion = (p) => {
    setEditando(true);
    setIdEditar(p.IDPERSONA);
    setForm({
        idTipoPersona: p.IDTIPOPERSONA,
        nombre: p.NOMBRE,
        apellido: p.APELLIDO,
        // La fecha debe venir en formato YYYY-MM-DD para el input type="date"
        fechaNacimiento: p.FECHANACIMIENTO ? p.FECHANACIMIENTO.substring(0, 10) : '',
        domicilio: p.DOMICILIO,
        telefono: p.TELEFONO,
        correo: p.CORREO
    });
};

const eliminarPersona = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta persona?")) {
        await fetch(`http://localhost:5000/persona/${id}`, { method: 'DELETE' });
        cargarPersonas();
    }
};

    const cargarPersonas = async () => {
        try {
            const res = await fetch('http://localhost:5000/persona');
            const data = await res.json();
            setPersonas(data);
        } catch (error) {
            console.error("Error al cargar:", error);
        }
    };

    useEffect(() => { cargarPersonas(); }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const guardarPersona = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                cargarPersonas();
                setForm({ idTipoPersona: '', nombre: '', apellido: '', fechaNacimiento: '', domicilio: '', telefono: '', correo: '' });
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

   return (
    <div>
        <h3>Gestión de Personas</h3>
        <form onSubmit={guardarPersona} className="grid-form">
            <input name="nombre" value={form.nombre} placeholder="Nombre" onChange={handleChange} required />
            <input name="apellido" value={form.apellido} placeholder="Apellido" onChange={handleChange} required />
            <input name="idTipoPersona" value={form.idTipoPersona} placeholder="ID Tipo Persona (FK)" onChange={handleChange} required />
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
            <input name="domicilio" value={form.domicilio} placeholder="Domicilio" onChange={handleChange} />
            <input name="telefono" value={form.telefono} placeholder="Teléfono" onChange={handleChange} />
            <input name="correo" value={form.correo} placeholder="Correo" onChange={handleChange} />
            
            <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2' }}>
                <button 
                    type="submit" 
                    className={editando ? "btn-update" : "btn-add"}
                    style={{ flex: 1, backgroundColor: editando ? '#2196F3' : '#28a745' }}
                >
                    {editando ? "Actualizar Persona" : "Guardar Persona"}
                </button>

                {editando && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setEditando(false);
                            setForm({ idTipoPersona: '', nombre: '', apellido: '', fechaNacimiento: '', domicilio: '', telefono: '', correo: '' });
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
                    <th>ID Tipo</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {personas.map((p) => (
                    <tr key={p.IDPERSONA}>
                        <td style={{ fontWeight: 'bold', color: '#2ecc71' }}>{p.IDTIPOPERSONA}</td>
                        <td>{p.NOMBRE}</td>
                        <td>{p.APELLIDO}</td>
                        <td>{p.CORREO}</td>
                        <td>
                            <button className="btn-edit" onClick={() => prepararEdicion(p)}>✏️</button>
                            <button className="btn-delete" onClick={() => eliminarPersona(p.IDPERSONA)}>🗑️</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};

export default PersonaCRUD;
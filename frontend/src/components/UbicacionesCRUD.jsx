import React, { useState, useEffect } from 'react';

const UbicacionesCRUD = () => {
    // ESTADOS PRINCIPALES
    const [vistaLocal, setVistaLocal] = useState('pais'); // pais, departamento, ciudad
    const [datos, setDatos] = useState([]);
    const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: '' });

    // ESTADOS PARA FORMULARIO (CREAR/EDITAR)
    const [nombre, setNombre] = useState('');
    const [idRelacion, setIdRelacion] = useState(''); // Para el FK (idPais o idDepartamento)
    const [editando, setEditando] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    // 1. CARGAR DATOS
    const cargarDatos = async () => {
        try {
            const res = await fetch(`http://localhost:5000/${vistaLocal}`);
            const data = await res.json();
            setDatos(data);
        } catch (error) {
            mostrarAviso("Error al conectar con el servidor", "error");
        }
    };

    useEffect(() => { 
        cancelarEdicion();
        cargarDatos(); 
    }, [vistaLocal]);

    // 2. MOSTRAR AVISOS (CSS Toast)
    const mostrarAviso = (msg, tipo) => {
        setNotificacion({ mensaje: msg, tipo: tipo });
        setTimeout(() => setNotificacion({ mensaje: '', tipo: '' }), 3000);
    };

    // 3. GUARDAR O ACTUALIZAR
    const guardar = async (e) => {
        e.preventDefault();
        
        const url = editando 
            ? `http://localhost:5000/${vistaLocal}/${idEditar}` 
            : `http://localhost:5000/${vistaLocal}`;
        
        const metodo = editando ? 'PUT' : 'POST';
        
        // Armamos el body según la tabla
        let body = { nombre };
        if (vistaLocal === 'departamento') body.idPais = idRelacion;
        if (vistaLocal === 'ciudad') body.idDepartamento = idRelacion;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const msjServer = await res.text();

            if (res.ok) {
                mostrarAviso(msjServer, "exito");
                cancelarEdicion();
                cargarDatos();
            } else {
                mostrarAviso(msjServer, "error");
            }
        } catch (error) {
            mostrarAviso("Error en la petición", "error");
        }
    };

    // 4. ELIMINAR
    const eliminar = async (item) => {
        const id = Object.values(item)[0]; // Captura el primer campo (PK)
        const columna = vistaLocal === 'pais' ? 'idPais' : 
                        vistaLocal === 'departamento' ? 'idDepartamento' : 'idCiudad';

        if (window.confirm(`¿Seguro que deseas eliminar este registro de ${vistaLocal}?`)) {
            try {
                const res = await fetch(`http://localhost:5000/eliminar-geo/${vistaLocal}/${columna}/${id}`, {
                    method: 'DELETE'
                });
                const msj = await res.text();
                if (res.ok) {
                    mostrarAviso(msj, "exito");
                    cargarDatos();
                } else {
                    mostrarAviso(msj, "error");
                }
            } catch (error) {
                mostrarAviso("No se pudo eliminar", "error");
            }
        }
    };

    const prepararEdicion = (item) => {
        const valores = Object.values(item);
        setEditando(true);
        setIdEditar(valores[0]);
        setNombre(item.NOMBRE);
        if (vistaLocal !== 'pais') setIdRelacion(valores[2]); // Carga el FK
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setIdEditar(null);
        setNombre('');
        setIdRelacion('');
    };

    return (
        <div className="container-geo">
            <h2>Configuración de Ubicaciones</h2>
            
            {/* SUB-NAVEGACIÓN */}
            <nav className="nav-local">
                <button onClick={() => setVistaLocal('pais')} className={vistaLocal === 'pais' ? 'active' : ''}>Países</button>
                <button onClick={() => setVistaLocal('departamento')} className={vistaLocal === 'departamento' ? 'active' : ''}>Departamentos</button>
                <button onClick={() => setVistaLocal('ciudad')} className={vistaLocal === 'ciudad' ? 'active' : ''}>Ciudades</button>
            </nav>

            {/* FORMULARIO */}
            <form onSubmit={guardar} className="grid-form card">
                <h4>{editando ? `Editando ${vistaLocal}` : `Nuevo ${vistaLocal}`}</h4>
                <div className="form-group">
                    <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    
                    {vistaLocal !== 'pais' && (
                        <input 
                            type="number" 
                            placeholder={vistaLocal === 'departamento' ? "ID País (FK)" : "ID Departamento (FK)"} 
                            value={idRelacion} 
                            onChange={e => setIdRelacion(e.target.value)} 
                            required 
                        />
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-save">{editando ? 'Actualizar' : 'Guardar'}</button>
                    {editando && <button type="button" onClick={cancelarEdicion} className="btn-cancel">Cancelar</button>}
                </div>
            </form>

            {/* TABLA DE RESULTADOS */}
            <table className="table-geo">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        {vistaLocal !== 'pais' && <th>Pertenece a (FK)</th>}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map((item, index) => (
                        <tr key={index}>
                            <td>{Object.values(item)[0]}</td>
                            <td>{item.NOMBRE}</td>
                            {vistaLocal !== 'pais' && (
                                <td>{item.PAIS_NOMBRE || item.DEP_NOMBRE} (ID: {Object.values(item)[2]})</td>
                            )}
                            <td>
                                <button className="btn-edit" onClick={() => prepararEdicion(item)}>✏️</button>
                                <button className="btn-delete" onClick={() => eliminar(item)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* NOTIFICACIÓN CSS TOAST */}
            {notificacion.mensaje && (
                <div className={`notificacion-flotante notificacion-${notificacion.tipo}`}>
                    {notificacion.mensaje}
                </div>
            )}
        </div>
    );
};

export default UbicacionesCRUD;
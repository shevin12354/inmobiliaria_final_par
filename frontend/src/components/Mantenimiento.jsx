import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Mantenimiento = () => {
    const [modulo, setModulo] = useState('gestion_mant'); // gestion_mant o gestion_pagos
    const [registros, setRegistros] = useState([]);
    const [editando, setEditando] = useState(false);
    const [idReferencia, setIdReferencia] = useState(null);

    // Formulario Mantenimiento (Siguiendo Diccionario 1)
    const [formMant, setFormMant] = useState({
        idMantenimiento: '',
        idApartamento: '',
        idEmpleado: '',
        fecha: '',
        descripcion: '',
        valor: ''
    });

    // Formulario Pago Mantenimiento (Siguiendo Diccionario 2)
    const [formPago, setFormPago] = useState({
        idPagoMntenimiento: '', 
        idMantenimiento: '',
        idFormaPago: '',
        fechaPago: '',
        valor: ''
    });

    useEffect(() => {
        fetchDatos();
    }, [modulo]);

    const fetchDatos = async () => {
        const endpoint = modulo === 'gestion_mant' ? 'mantenimiento' : 'pago-mantenimiento';
        try {
            const res = await fetch(`http://localhost:5000/${endpoint}`);
            const data = await res.json();
            setRegistros(data);
        } catch (error) {
            console.error("Error al cargar datos", error);
        }
    };

    const lanzarNotificacion = (msg, icon) => {
        Swal.fire({
            title: icon === 'success' ? '¡Éxito!' : 'Atención',
            text: msg,
            icon: icon,
            confirmButtonColor: '#3085d6'
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const esMant = modulo === 'gestion_mant';
        const endpoint = esMant ? 'mantenimiento' : 'pago-mantenimiento';
        const url = editando 
            ? `http://localhost:5000/${endpoint}/${idReferencia}` 
            : `http://localhost:5000/${endpoint}`;
        
        const payload = esMant ? formMant : formPago;

        try {
            const res = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                lanzarNotificacion(editando ? "Registro actualizado" : "Registro creado", "success");
                limpiarFormulario();
                fetchDatos();
            } else {
                const msj = await res.text();
                lanzarNotificacion(msj, "error");
            }
        } catch (error) {
            lanzarNotificacion("Error de conexión con el servidor", "error");
        }
    };

    const handleEliminar = async (id) => {
        const confirmar = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmar.isConfirmed) {
            const endpoint = modulo === 'gestion_mant' ? 'mantenimiento' : 'pago-mantenimiento';
            try {
                const res = await fetch(`http://localhost:5000/${endpoint}/${id}`, { method: 'DELETE' });
                const msj = await res.text();
                if (res.ok) {
                    lanzarNotificacion("Borrado exitosamente", "success");
                    fetchDatos();
                } else {
                    lanzarNotificacion(msj, "error");
                }
            } catch (error) {
                lanzarNotificacion("Error al intentar eliminar", "error");
            }
        }
    };

    const prepararEdicion = (item) => {
        setEditando(true);
        if (modulo === 'gestion_mant') {
            setIdReferencia(item.IDMANTENIMIENTO);
            setFormMant({
                idMantenimiento: item.IDMANTENIMIENTO,
                idApartamento: item.IDAPARTAMENTO,
                idEmpleado: item.IDEMPLEADO,
                fecha: item.FECHA?.split('T')[0],
                descripcion: item.DESCRIPCION || '',
                valor: item.VALOR
            });
        } else {
            setIdReferencia(item.IDPAGOMANTENIMIENTO);
            setFormPago({
                idPagoMntenimiento: item.IDPAGOMANTENIMIENTO,
                idMantenimiento: item.IDMANTENIMIENTO,
                idFormaPago: item.IDFORMAPAGO,
                fechaPago: item.FECHAPAGO?.split('T')[0],
                valor: item.VALOR
            });
        }
    };

    const limpiarFormulario = () => {
        setEditando(false);
        setIdReferencia(null);
        setFormMant({ idMantenimiento: '', idApartamento: '', idEmpleado: '', fecha: '', descripcion: '', valor: '' });
        setFormPago({ idPagoMntenimiento: '', idMantenimiento: '', idFormaPago: '', fechaPago: '', valor: '' });
    };

    return (
        <div className="panel-contratos">
            <header className="modulo-header">
                <h2>Gestión de Mantenimientos y Pagos</h2>
                <nav className="tabs-profesionales">
                    <button className={modulo === 'gestion_mant' ? 'tab-active' : ''} onClick={() => setModulo('gestion_mant')}>
                        Mantenimientos
                    </button>
                    <button className={modulo === 'gestion_pagos' ? 'tab-active' : ''} onClick={() => setModulo('gestion_pagos')}>
                        Pagos Realizados
                    </button>
                </nav>
            </header>

            <section className="form-container card">
                <h3>{editando ? `Modificando ID: ${idReferencia}` : 'Nuevo Registro'}</h3>
                <form onSubmit={handleGuardar} className="grid-layout">
                    {modulo === 'gestion_mant' ? (
                        <div className="inputs-group">
                            <input type="number" placeholder="ID Mantenimiento" value={formMant.idMantenimiento} onChange={e => setFormMant({ ...formMant, idMantenimiento: e.target.value })} disabled={editando} required />
                            <input type="number" placeholder="ID Apartamento" value={formMant.idApartamento} onChange={e => setFormMant({ ...formMant, idApartamento: e.target.value })} required />
                            <input type="number" placeholder="ID Empleado" value={formMant.idEmpleado} onChange={e => setFormMant({ ...formMant, idEmpleado: e.target.value })} required />
                            <input type="date" value={formMant.fecha} onChange={e => setFormMant({ ...formMant, fecha: e.target.value })} required />
                            <input type="text" placeholder="Descripción de la labor" value={formMant.descripcion} onChange={e => setFormMant({ ...formMant, descripcion: e.target.value })} />
                            <input type="number" step="0.01" placeholder="Valor Total" value={formMant.valor} onChange={e => setFormMant({ ...formMant, valor: e.target.value })} required />
                        </div>
                    ) : (
                        <div className="inputs-group">
                            <input type="number" placeholder="ID Pago" value={formPago.idPagoMntenimiento} onChange={e => setFormPago({ ...formPago, idPagoMntenimiento: e.target.value })} disabled={editando} required />
                            <input type="number" placeholder="ID Mantenimiento" value={formPago.idMantenimiento} onChange={e => setFormPago({ ...formPago, idMantenimiento: e.target.value })} required />
                            <input type="number" placeholder="ID Forma de Pago" value={formPago.idFormaPago} onChange={e => setFormPago({ ...formPago, idFormaPago: e.target.value })} required />
                            <input type="date" value={formPago.fechaPago} onChange={e => setFormPago({ ...formPago, fechaPago: e.target.value })} required />
                            <input type="number" step="0.01" placeholder="Valor Pagado" value={formPago.valor} onChange={e => setFormPago({ ...formPago, valor: e.target.value })} required />
                        </div>
                    )}
                    <div className="form-actions" style={{ gridColumn: '1/-1', marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-primary">
                            {editando ? 'Confirmar Edición' : 'Registrar en Sistema'}
                        </button>
                        {editando && <button type="button" className="btn-secondary" onClick={limpiarFormulario}>Cancelar</button>}
                    </div>
                </form>
            </section>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        {modulo === 'gestion_mant' ? (
                            <tr>
                                <th>ID</th><th>Apt</th><th>Emp</th><th>Fecha</th><th>Descripción</th><th>Valor</th><th>Acciones</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>ID Pago</th><th>Ref. Mant</th><th>F. Pago</th><th>Fecha</th><th>Valor</th><th>Acciones</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {registros.map((reg, i) => (
                            <tr key={i}>
                                {modulo === 'gestion_mant' ? (
                                    <>
                                        <td>{reg.IDMANTENIMIENTO}</td>
                                        <td>{reg.IDAPARTAMENTO}</td>
                                        <td>{reg.IDEMPLEADO}</td>
                                        <td>{reg.FECHA?.split('T')[0]}</td>
                                        <td>{reg.DESCRIPCION || '---'}</td>
                                        <td>${reg.VALOR}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{reg.IDPAGOMANTENIMIENTO}</td>
                                        <td>{reg.IDMANTENIMIENTO}</td>
                                        <td>{reg.IDFORMAPAGO}</td>
                                        <td>{reg.FECHAPAGO?.split('T')[0]}</td>
                                        <td>${reg.VALOR}</td>
                                    </>
                                )}
                                <td>
                                    <button className="action-btn edit" onClick={() => prepararEdicion(reg)}>Editar</button>
                                    <button className="action-btn delete" onClick={() => handleEliminar(modulo === 'gestion_mant' ? reg.IDMANTENIMIENTO : reg.IDPAGOMANTENIMIENTO)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Mantenimiento;
import React, { useState, useEffect } from 'react';

const Contratos = () => {
    const [modulo, setModulo] = useState('gestion_apt'); 
    const [registros, setRegistros] = useState([]);
    const [formasPago, setFormasPago] = useState([]); 
    const [editando, setEditando] = useState(false);
    const [idReferencia, setIdReferencia] = useState(null);
    const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: '' });

    const [formApt, setFormApt] = useState({ 
        idPropietario: '', idCiudad: '', direccion: '', numHab: '', estado: 1, pago: '' 
    });

    const [formCont, setFormCont] = useState({ 
        idCliente: '', idApt: '', fInicio: '', fFin: '', valor: '', obs: '', idFormaPago: '' 
    });

    const [formFP, setFormFP] = useState({ 
        idFormaPago: '', descripcion: '' 
    });

    const lanzarNotificacion = (msg, tipo) => {
        setNotificacion({ mensaje: msg, tipo: tipo });
        setTimeout(() => setNotificacion({ mensaje: '', tipo: '' }), 3500);
    };

    const fetchDatos = async () => {
        let endpoint = modulo === 'gestion_apt' ? 'apartamento' : modulo === 'gestion_cont' ? 'contrato' : 'forma-pago';
        try {
            const res = await fetch(`http://localhost:5000/${endpoint}`);
            const data = await res.json();
            setRegistros(data);

            if (modulo === 'gestion_cont') {
                const resFp = await fetch(`http://localhost:5000/forma-pago`);
                const dataFp = await resFp.json();
                setFormasPago(dataFp);
            }
        } catch (error) { 
            lanzarNotificacion("Fallo en la conexión con el servidor", "error"); 
        }
    };

    useEffect(() => { 
        limpiarFormulario();
        fetchDatos(); 
    }, [modulo]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        const esApt = modulo === 'gestion_apt';
        const esCont = modulo === 'gestion_cont';
        let endpoint = esApt ? 'apartamento' : esCont ? 'contrato' : 'forma-pago';
        const url = editando ? `http://localhost:5000/${endpoint}/${idReferencia}` : `http://localhost:5000/${endpoint}`;
        
        let payload;
        if (esApt) {
            payload = {
                idPropietario: formApt.idPropietario,
                idCiudad: formApt.idCiudad,
                direccion: formApt.direccion,
                numeroHabitacion: formApt.numHab,
                estado: formApt.estado,
                pagoMensual: formApt.pago
            };
        } else if (esCont) {
            payload = {
                idCliente: formCont.idCliente,
                idApartamento: formCont.idApt,
                fechaInicio: formCont.fInicio,
                fechaFin: formCont.fFin,
                valorMensual: formCont.valor,
                observacion: formCont.obs
            };
        } else {
            payload = {
                idFormaPago: formFP.idFormaPago,
                descripcion: formFP.descripcion
            };
        }

        try {
            const res = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const respuesta = await res.text();

            if (res.ok) {
                lanzarNotificacion(respuesta, "exito");
                limpiarFormulario();
                fetchDatos();
            } else {
                lanzarNotificacion(respuesta, "error");
            }
        } catch (error) {
            lanzarNotificacion("Error al procesar la solicitud", "error");
        }
    };

    const handleEliminar = async (id) => {
        let endpoint = modulo === 'gestion_apt' ? 'apartamento' : modulo === 'gestion_cont' ? 'contrato' : 'forma-pago';

        if (window.confirm("¿Confirma la eliminación definitiva?")) {
            try {
                const res = await fetch(`http://localhost:5000/${endpoint}/${id}`, {
                    method: 'DELETE'
                });

                const msj = await res.text();

                if (res.ok) {
                    lanzarNotificacion(msj, "exito");
                    fetchDatos();
                } else {
                    lanzarNotificacion(msj, "error");
                }
            } catch (error) {
                lanzarNotificacion("Error al eliminar", "error");
            }
        }
    };

    const prepararEdicion = (item) => {
        setEditando(true);

        if (modulo === 'gestion_apt') {
            setIdReferencia(item.IDAPARTAMENTO);
            setFormApt({
                idPropietario: item.IDPROPIETARIO,
                idCiudad: item.IDCIUDAD,
                direccion: item.DIRECCION,
                numHab: item.NUMEROHABITACION,
                estado: item.ESTADO,
                pago: item.PAGOMENSUAL
            });
        } else if (modulo === 'gestion_cont') {
            setIdReferencia(item.IDCONTRATO);
            setFormCont({
                idCliente: item.IDCLIENTE,
                idApt: item.IDAPARTAMENTO,
                fInicio: item.FECHAINICIO?.split('T')[0],
                fFin: item.FECHAFIN?.split('T')[0],
                valor: item.VALORMENSUAL,
                obs: item.OBSERVACION || ''
            });
        } else {
            setIdReferencia(item.IDFORMAPAGO);
            setFormFP({
                idFormaPago: item.IDFORMAPAGO,
                descripcion: item.DESCRIPCION
            });
        }
    };

    const limpiarFormulario = () => {
        setEditando(false);
        setIdReferencia(null);

        setFormApt({
            idPropietario: '',
            idCiudad: '',
            direccion: '',
            numHab: '',
            estado: 1,
            pago: ''
        });

        setFormCont({
            idCliente: '',
            idApt: '',
            fInicio: '',
            fFin: '',
            valor: '',
            obs: ''
        });

        setFormFP({
            idFormaPago: '',
            descripcion: ''
        });
    };

    return (
        <div className="panel-contratos">
            <header className="modulo-header">
                <h2>Panel de Gestión: Inmuebles y Contratos</h2>

                <nav className="tabs-profesionales">
                    <button
                        className={modulo === 'gestion_apt' ? 'tab-active' : ''}
                        onClick={() => setModulo('gestion_apt')}
                    >
                        Unidades (Apartamentos)
                    </button>

                    <button
                        className={modulo === 'gestion_cont' ? 'tab-active' : ''}
                        onClick={() => setModulo('gestion_cont')}
                    >
                        Contratos Vigentes
                    </button>

                    <button
                        className={modulo === 'gestion_fp' ? 'tab-active' : ''}
                        onClick={() => setModulo('gestion_fp')}
                    >
                        Formas de Pago
                    </button>
                </nav>
            </header>

            <section className="form-container card">
                <h3>{editando ? `Editando ID: ${idReferencia}` : 'Nueva Entrada'}</h3>

                <form onSubmit={handleGuardar} className="grid-layout">
                    {modulo === 'gestion_apt' ? (
                        <div className="inputs-group">
                            <input type="number" placeholder="ID Propietario" value={formApt.idPropietario} onChange={e => setFormApt({ ...formApt, idPropietario: e.target.value })} required />
                            <input type="number" placeholder="ID Ciudad" value={formApt.idCiudad} onChange={e => setFormApt({ ...formApt, idCiudad: e.target.value })} required />
                            <input type="text" placeholder="Dirección Exacta" value={formApt.direccion} onChange={e => setFormApt({ ...formApt, direccion: e.target.value })} required />
                            <input type="number" placeholder="Habitaciones" value={formApt.numHab} onChange={e => setFormApt({ ...formApt, numHab: e.target.value })} required />
                            <input type="number" placeholder="Canon Mensual" value={formApt.pago} onChange={e => setFormApt({ ...formApt, pago: e.target.value })} required />

                            <select value={formApt.estado} onChange={e => setFormApt({ ...formApt, estado: parseInt(e.target.value) })}>
                                <option value="1">Disponible</option>
                                <option value="0">Ocupado</option>
                            </select>
                        </div>
                    ) : modulo === 'gestion_cont' ? (
                        <div className="inputs-group">
                            <input type="number" placeholder="ID Cliente" value={formCont.idCliente} onChange={e => setFormCont({ ...formCont, idCliente: e.target.value })} required />
                            <input type="number" placeholder="ID Apartamento" value={formCont.idApt} onChange={e => setFormCont({ ...formCont, idApt: e.target.value })} required />
                            <input type="date" value={formCont.fInicio} onChange={e => setFormCont({ ...formCont, fInicio: e.target.value })} required />
                            <input type="date" value={formCont.fFin} onChange={e => setFormCont({ ...formCont, fFin: e.target.value })} />
                            <input type="number" placeholder="Valor Mensual" value={formCont.valor} onChange={e => setFormCont({ ...formCont, valor: e.target.value })} required />

                            <textarea
                                placeholder="Observaciones del contrato"
                                value={formCont.obs}
                                onChange={e => setFormCont({ ...formCont, obs: e.target.value })}
                                style={{ gridColumn: '1 / -1', marginTop: '10px', minHeight: '60px' }}
                            />
                        </div>
                    ) : (
                        <div className="inputs-group">
                            <input type="number" placeholder="ID Forma Pago" value={formFP.idFormaPago} onChange={e => setFormFP({ ...formFP, idFormaPago: e.target.value })} disabled={editando} required />
                            <input type="text" placeholder="Descripción" value={formFP.descripcion} onChange={e => setFormFP({ ...formFP, descripcion: e.target.value })} required />
                        </div>
                    )}

                    <button type="submit" className="btn-primary">
                        {editando ? 'Confirmar Cambios' : 'Registrar Datos'}
                    </button>
                </form>
            </section>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        {modulo === 'gestion_apt' ? (
                            <tr>
                                <th>ID</th>
                                <th>Dirección</th>
                                <th>Prop.</th>
                                <th>Ciudad</th>
                                <th>Habs</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Operaciones</th>
                            </tr>
                        ) : modulo === 'gestion_cont' ? (
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Unidad</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Valor</th>
                                <th>Observaciones</th>
                                <th>Operaciones</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Operaciones</th>
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {registros.map((reg, i) => (
                            <tr key={i}>
                                {modulo === 'gestion_apt' ? (
                                    <>
                                        <td>{reg.IDAPARTAMENTO}</td>
                                        <td>{reg.DIRECCION}</td>
                                        <td>{reg.IDPROPIETARIO}</td>
                                        <td>{reg.IDCIUDAD}</td>
                                        <td>{reg.NUMEROHABITACION}</td>
                                        <td>${reg.PAGOMENSUAL}</td>
                                        <td className={reg.ESTADO === 1 ? 'txt-success' : 'txt-danger'}>
                                            {reg.ESTADO === 1 ? 'Disponible' : 'Ocupado'}
                                        </td>
                                    </>
                                ) : modulo === 'gestion_cont' ? (
                                    <>
                                        <td>{reg.IDCONTRATO}</td>
                                        <td>{reg.CLIENTE_NOM || reg.IDCLIENTE}</td>
                                        <td>{reg.APT_DIR || reg.IDAPARTAMENTO}</td>
                                        <td>{reg.FECHAINICIO?.split('T')[0]}</td>
                                        <td>{reg.FECHAFIN?.split('T')[0] || 'N/A'}</td>
                                        <td>${reg.VALORMENSUAL}</td>
                                        <td>{reg.OBSERVACION || '---'}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{reg.IDFORMAPAGO}</td>
                                        <td>{reg.DESCRIPCION}</td>
                                    </>
                                )}

                                <td>
                                    <button className="action-btn edit" onClick={() => prepararEdicion(reg)}>
                                        Editar
                                    </button>

                                    <button
                                        className="action-btn delete"
                                        onClick={() =>
                                            handleEliminar(
                                                modulo === 'gestion_apt'
                                                    ? reg.IDAPARTAMENTO
                                                    : modulo === 'gestion_cont'
                                                    ? reg.IDCONTRATO
                                                    : reg.IDFORMAPAGO
                                            )
                                        }
                                    >
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

export default Contratos;
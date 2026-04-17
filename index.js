const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

oracledb.initOracleClient({ libDir: 'C:\\oracle_client' });
const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'ldprogram2',
    password: '132',
    connectString: 'localhost/xe'
};

// --- OBTENER INGRESOS TOTALES ---
app.get('/ingresos', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        const result = await conn.execute(
            `SELECT NVL(SUM(valorMensual), 0) AS TOTAL FROM CONTRATO`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows[0]);

    } catch (e) {
        res.status(500).send("Error: " + e.message);
    } finally {
        if (conn) await conn.close();
    }
});

// --- RUTA: LEER ---
app.get('/tipopersona', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            'SELECT * FROM TipoPersona ORDER BY idTipoPersona ASC',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// --- RUTA: CREAR (ARREGLADA) ---
app.post('/tipopersona', async (req, res) => {
    const { descripcion } = req.body;
    if (!descripcion) return res.status(400).send('Descripción requerida');

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        // Arreglo: Insertamos el ID calculando el máximo + 1
        await connection.execute(
            `INSERT INTO TipoPersona (idTipoPersona, descripcion) 
             VALUES ((SELECT NVL(MAX(idTipoPersona), 0) + 1 FROM TipoPersona), :descripcion)`,
            { descripcion },
            { autoCommit: true }
        );
        res.status(201).send('Creado correctamente');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// --- RUTA: EDITAR ---
app.put('/tipopersona/:id', async (req, res) => {
    const { descripcion } = req.body;
    const { id } = req.params;

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `UPDATE TipoPersona SET descripcion = :descripcion WHERE idTipoPersona = :id`,
            { descripcion, id },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) return res.status(404).send('ID no encontrado');
        res.send('Actualizado correctamente');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

app.post('/persona', async (req, res) => {
    // 1. Extraemos los datos tal cual vienen del Frontend (camelCase)
    const { idTipoPersona, nombre, apellido, fechaNacimiento, domicilio, telefono, correo } = req.body;
    
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        await connection.execute(
            `INSERT INTO Persona (
                IDPERSONA, IDTIPOPERSONA, NOMBRE, APELLIDO, 
                FECHANACIMIENTO, DOMICILIO, TELEFONO, CORREO
            ) VALUES (
                (SELECT NVL(MAX(IDPERSONA), 0) + 1 FROM PERSONA), 
                :idTipoPersona, :nombre, :apellido, 
                TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'), 
                :domicilio, :telefono, :correo
            )`,
            // 2. Pasamos el objeto con los mismos nombres que usamos arriba en los ":"
            { 
                idTipoPersona, 
                nombre, 
                apellido, 
                fechaNacimiento, 
                domicilio, 
                telefono, 
                correo 
            },
            { autoCommit: true }
        );
        res.status(201).send('Persona registrada');
    } catch (error) {
        console.error("Error en Oracle:", error.message);
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// ELIMINAR PERSONA
app.delete('/persona/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `DELETE FROM PERSONA WHERE IDPERSONA = :id`,
            [id],
            { autoCommit: true }
        );
        res.send('Persona eliminada');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// EDITAR PERSONA
app.put('/persona/:id', async (req, res) => {
    const { id } = req.params;
    const { idTipoPersona, nombre, apellido, fechaNacimiento, domicilio, telefono, correo } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `UPDATE PERSONA SET 
                IDTIPOPERSONA = :idTipoPersona, 
                NOMBRE = :nombre, 
                APELLIDO = :apellido, 
                FECHANACIMIENTO = TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'), 
                DOMICILIO = :domicilio, 
                TELEFONO = :telefono, 
                CORREO = :correo 
             WHERE IDPERSONA = :id`,
            { idTipoPersona, nombre, apellido, fechaNacimiento, domicilio, telefono, correo, id },
            { autoCommit: true }
        );
        res.send('Persona actualizada');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

app.get('/persona', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        // Usamos outFormat para que nos devuelva un objeto con nombres de columnas
        const result = await connection.execute(
            `SELECT * FROM PERSONA ORDER BY IDPERSONA DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );
        res.json(result.rows); // Esto es lo que recibe setPersonas(data)
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// --- RUTA: ELIMINAR ---
app.delete('/tipopersona/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `DELETE FROM TipoPersona WHERE idTipoPersona = :id`,
            { id },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) return res.status(404).send('ID no encontrado');
        res.send('Eliminado correctamente');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});
app.get('/empleado', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT e.IDEMPLEADO, e.IDPERSONA, p.NOMBRE, p.APELLIDO 
             FROM EMPLEADO e
             JOIN PERSONA p ON e.IDPERSONA = p.IDPERSONA`, 
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

app.post('/empleado', async (req, res) => {
    const { idPersona } = req.body; 
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO EMPLEADO (idEmpleado, idPersona) 
             VALUES ((SELECT NVL(MAX(idEmpleado), 0) + 1 FROM EMPLEADO), :idPersona)`,
            { idPersona }, 
            { autoCommit: true }
        );
        res.status(201).send('Empleado registrado con éxito');
    } catch (error) {
        // ORA-02291: error de integridad referencial (no existe el padre)
        if (error.message.includes("ORA-02291")) {
            res.status(400).send("No puedes registrar al empleado: El ID de Persona no existe.");
        } else {
            res.status(500).send("Error en Oracle: " + error.message);
        }
    } finally {
        if (connection) await connection.close();
    }
});
// ELIMINAR EMPLEADO
app.delete('/empleado/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `DELETE FROM EMPLEADO WHERE idEmpleado = :id`,
            [id],
            { autoCommit: true }
        );
        res.send('Empleado eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// EDITAR EMPLEADO (Solo actualizar la persona vinculada)
app.put('/empleado/:id', async (req, res) => {
    const { id } = req.params;
    const { idPersona } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `UPDATE EMPLEADO SET idPersona = :idPersona WHERE idEmpleado = :id`,
            { idPersona, id },
            { autoCommit: true }
        );
        res.send('Empleado actualizado');
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// --- RUTAS PARA PROPIETARIO ---

app.get('/propietario', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT pr.idPropietario, pr.idPersona, p.nombre, p.apellido 
             FROM PROPIETARIO pr
             JOIN PERSONA p ON pr.idPersona = p.idPersona`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});



app.post('/propietario', async (req, res) => {
    const { idPersona } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO PROPIETARIO (idPropietario, idPersona) 
             VALUES ((SELECT NVL(MAX(idPropietario), 0) + 1 FROM PROPIETARIO), :idPersona)`,
            { idPersona }, { autoCommit: true }
        );
        res.status(201).send('Propietario registrado con éxito');
    } catch (error) {
        if (error.message.includes("ORA-02291")) {
            res.status(400).send("No existe una Persona con ese ID.");
        } else {
            res.status(500).send(error.message);
        }
    } finally {
        if (connection) await connection.close();
    }
});
// ELIMINAR PROPIETARIO
app.delete('/propietario/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `DELETE FROM PROPIETARIO WHERE idPropietario = :id`,
            [id],
            { autoCommit: true }
        );
        res.send('Propietario eliminado correctamente');
    } catch (error) {
        res.status(500).send("Error al eliminar: " + error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// EDITAR PROPIETARIO
app.put('/propietario/:id', async (req, res) => {
    const { id } = req.params;
    const { idPersona } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `UPDATE PROPIETARIO SET idPersona = :idPersona WHERE idPropietario = :id`,
            { idPersona, id },
            { autoCommit: true }
        );
        res.send('Datos del propietario actualizados');
    } catch (error) {
        if (error.message.includes("ORA-02291")) {
            res.status(400).send("Error: El nuevo ID de Persona no existe.");
        } else {
            res.status(500).send("Error al actualizar: " + error.message);
        }
    } finally {
        if (connection) await connection.close();
    }
});

// ==========================================
// CRUD: APARTAMENTO
// ==========================================
app.get('/apartamento', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT a.*, p.nombre as PROPIETARIO, c.nombre as CIUDAD 
             FROM APARTAMENTO a
             JOIN PROPIETARIO pr ON a.idPropietario = pr.idPropietario
             JOIN PERSONA p ON pr.idPersona = p.idPersona
             JOIN CIUDAD c ON a.idCiudad = c.idCiudad`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (e) { res.status(500).send(e.message); } finally { if (conn) await conn.close(); }
});

app.post('/apartamento', async (req, res) => {
    const { idPropietario, idCiudad, direccion, numeroHabitacion, estado, pagoMensual } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO APARTAMENTO (idApartamento, idPropietario, idCiudad, direccion, numeroHabitacion, estado, pagoMensual) 
             VALUES ((SELECT NVL(MAX(idApartamento), 0) + 1 FROM APARTAMENTO), :idPropietario, :idCiudad, :direccion, :numeroHabitacion, :estado, :pagoMensual)`,
            { idPropietario, idCiudad, direccion, numeroHabitacion, estado, pagoMensual }, { autoCommit: true }
        );
        res.status(201).send('Apartamento registrado correctamente');
    } catch (e) {
        if (e.message.includes("ORA-02291")) res.status(400).send("Error: Propietario o Ciudad no existen.");
        else res.status(500).send(e.message);
    } finally { if (conn) await conn.close(); }
});
app.put('/apartamento/:id', async (req, res) => {
    const { id } = req.params;
    const { idPropietario, idCiudad, direccion, numeroHabitacion, estado, pagoMensual } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `UPDATE APARTAMENTO SET 
                idPropietario = :idPropietario, 
                idCiudad = :idCiudad, 
                direccion = :direccion, 
                numeroHabitacion = :numeroHabitacion, 
                estado = :estado, 
                pagoMensual = :pagoMensual 
             WHERE idApartamento = :id`,
            { idPropietario, idCiudad, direccion, numeroHabitacion, estado, pagoMensual, id },
            { autoCommit: true }
        );
        res.send('Apartamento actualizado con éxito');
    } catch (e) {
        res.status(500).send("Error al actualizar apartamento: " + e.message);
    } finally { if (conn) await conn.close(); }
});

// ELIMINAR APARTAMENTO
app.delete('/apartamento/:id', async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(`DELETE FROM APARTAMENTO WHERE idApartamento = :id`, [id], { autoCommit: true });
        res.send('Apartamento eliminado');
    } catch (e) {
        // Error ORA-02292: integridad referencial violada (si el apto ya tiene contratos)
        if (e.message.includes("ORA-02292")) {
            res.status(400).send("No puedes eliminar este apartamento porque ya tiene contratos registrados.");
        } else {
            res.status(500).send(e.message);
        }
    } finally { if (conn) await conn.close(); }
});
// --- OBTENER FORMAS DE PAGO ---
// --- OBTENER FORMAS DE PAGO ---
app.get('/forma-pago', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT IDFORMAPAGO, DESCRIPCION FROM FORMAPAGO ORDER BY IDFORMAPAGO ASC`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (e) { res.status(500).send("Error al obtener: " + e.message); }
    finally { if (conn) await conn.close(); }
});

// --- CREAR FORMA DE PAGO ---
app.post('/forma-pago', async (req, res) => {
    const { idFormaPago, descripcion } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO FORMAPAGO (IDFORMAPAGO, DESCRIPCION) VALUES (:idFormaPago, :descripcion)`,
            { idFormaPago, descripcion },
            { autoCommit: true }
        );
        res.status(201).send('Forma de pago registrada');
    } catch (e) { res.status(500).send("Error al crear: " + e.message); }
    finally { if (conn) await conn.close(); }
});

// --- EDITAR FORMA DE PAGO ---
app.put('/forma-pago/:id', async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `UPDATE FORMAPAGO SET DESCRIPCION = :descripcion WHERE IDFORMAPAGO = :id`,
            { descripcion, id },
            { autoCommit: true }
        );
        res.send('Forma de pago actualizada');
    } catch (e) { res.status(500).send("Error al editar: " + e.message); }
    finally { if (conn) await conn.close(); }
});

// --- ELIMINAR FORMA DE PAGO ---
app.delete('/forma-pago/:id', async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `DELETE FROM FORMAPAGO WHERE IDFORMAPAGO = :id`, 
            [id], 
            { autoCommit: true }
        );
        res.send('Forma de pago eliminada');
    } catch (e) { 
        res.status(500).send("Error al eliminar: " + e.message); 
    } finally { if (conn) await conn.close(); }
});
// ==========================================
// CRUD: CONTRATO
// ==========================================
// --- OBTENER CONTRATOS ---
app.get('/contrato', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT cont.*, per.nombre || ' ' || per.apellido as CLIENTE_NOM, apt.direccion as APT_DIR
             FROM CONTRATO cont
             JOIN CLIENTE cli ON cont.idCliente = cli.idCliente
             JOIN PERSONA per ON cli.idPersona = per.idPersona
             JOIN APARTAMENTO apt ON cont.idApartamento = apt.idApartamento`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// --- CREAR CONTRATO ---
app.post('/contrato', async (req, res) => {
    const { idCliente, idApartamento, fechaInicio, fechaFin, valorMensual, observacion } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO CONTRATO (idContrato, idCliente, idApartamento, fechaInicio, fechaFin, valorMensual, OBSERVACION) 
             VALUES ((SELECT NVL(MAX(idContrato), 0) + 1 FROM CONTRATO), :idCliente, :idApartamento, 
             TO_DATE(:fechaInicio, 'YYYY-MM-DD'), TO_DATE(:fechaFin, 'YYYY-MM-DD'), :valorMensual, :observacion)`,
            { idCliente, idApartamento, fechaInicio, fechaFin, valorMensual, observacion }, 
            { autoCommit: true }
        );
        res.status(201).send('Contrato generado con éxito');
    } catch (e) { res.status(500).send("Error en Contrato: " + e.message); } 
    finally { if (conn) await conn.close(); }
});

// --- EDITAR CONTRATO ---
app.put('/contrato/:id', async (req, res) => {
    const { id } = req.params;
    const { idCliente, idApartamento, fechaInicio, fechaFin, valorMensual, observacion } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `UPDATE CONTRATO SET 
                idCliente = :idCliente, 
                idApartamento = :idApartamento, 
                fechaInicio = TO_DATE(:fechaInicio, 'YYYY-MM-DD'), 
                fechaFin = TO_DATE(:fechaFin, 'YYYY-MM-DD'), 
                valorMensual = :valorMensual, 
                OBSERVACION = :observacion 
             WHERE idContrato = :id`,
            { idCliente, idApartamento, fechaInicio, fechaFin, valorMensual, observacion, id },
            { autoCommit: true }
        );
        res.send('Contrato actualizado');
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// --- ELIMINAR CONTRATO ---
app.delete('/contrato/:id', async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `DELETE FROM CONTRATO WHERE idContrato = :id`, 
            [id], 
            { autoCommit: true }
        );
        res.send('Contrato eliminado');
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// ==========================================
// 1. CRUD: PAIS (idPais, nombre)
// ==========================================

// Listar Países
app.get('/pais', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(`SELECT * FROM PAIS ORDER BY idPais`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (e) { res.status(500).send("Error: " + e.message); } 
    finally { if (conn) await conn.close(); }
});

// Guardar País
app.post('/pais', async (req, res) => {
    const { nombre } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO PAIS (idPais, nombre) VALUES ((SELECT NVL(MAX(idPais), 0) + 1 FROM PAIS), :nombre)`,
            { nombre }, { autoCommit: true }
        );
        res.status(201).send('País registrado con éxito');
    } catch (e) { res.status(500).send("Error al guardar: " + e.message); } 
    finally { if (conn) await conn.close(); }
});

// Editar País
app.put('/pais/:id', async (req, res) => {
    const { id } = req.params; const { nombre } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(`UPDATE PAIS SET nombre = :nombre WHERE idPais = :id`, { nombre, id }, { autoCommit: true });
        res.send('País actualizado');
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// ==========================================
// 2. CRUD: DEPARTAMENTO (idDepartamento, idPais, nombre)
// ==========================================

// Listar Departamentos (Con JOIN para ver el nombre del País)
app.get('/departamento', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT d.idDepartamento, d.nombre, d.idPais, p.nombre as PAIS_NOMBRE 
             FROM DEPARTAMENTO d 
             JOIN PAIS p ON d.idPais = p.idPais 
             ORDER BY d.idDepartamento`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// Guardar Departamento
app.post('/departamento', async (req, res) => {
    const { nombre, idPais } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO DEPARTAMENTO (idDepartamento, idPais, nombre) 
             VALUES ((SELECT NVL(MAX(idDepartamento), 0) + 1 FROM DEPARTAMENTO), :idPais, :nombre)`,
            { idPais, nombre }, { autoCommit: true }
        );
        res.status(201).send('Departamento registrado con éxito');
    } catch (e) {
        if (e.message.includes("ORA-02291")) res.status(400).send("Error: El ID del País no existe.");
        else res.status(500).send(e.message);
    } finally { if (conn) await conn.close(); }
});

// Editar Departamento
app.put('/departamento/:id', async (req, res) => {
    const { id } = req.params; const { nombre, idPais } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `UPDATE DEPARTAMENTO SET nombre = :nombre, idPais = :idPais WHERE idDepartamento = :id`, 
            { nombre, idPais, id }, { autoCommit: true }
        );
        res.send('Departamento actualizado');
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// ==========================================
// 3. CRUD: CIUDAD (idCiudad, idDepartamento, nombre)
// ==========================================

// Listar Ciudades (Con JOIN para ver el nombre del Departamento)
app.get('/ciudad', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `SELECT c.idCiudad, c.nombre, c.idDepartamento, d.nombre as DEP_NOMBRE 
             FROM CIUDAD c 
             JOIN DEPARTAMENTO d ON c.idDepartamento = d.idDepartamento 
             ORDER BY c.idCiudad`,
            [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// Guardar Ciudad
app.post('/ciudad', async (req, res) => {
    const { nombre, idDepartamento } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `INSERT INTO CIUDAD (idCiudad, idDepartamento, nombre) 
             VALUES ((SELECT NVL(MAX(idCiudad), 0) + 1 FROM CIUDAD), :idDepartamento, :nombre)`,
            { idDepartamento, nombre }, { autoCommit: true }
        );
        res.status(201).send('Ciudad registrada con éxito');
    } catch (e) {
        if (e.message.includes("ORA-02291")) res.status(400).send("Error: El ID del Departamento no existe.");
        else res.status(500).send(e.message);
    } finally { if (conn) await conn.close(); }
});

// Editar Ciudad
app.put('/ciudad/:id', async (req, res) => {
    const { id } = req.params; const { nombre, idDepartamento } = req.body;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `UPDATE CIUDAD SET nombre = :nombre, idDepartamento = :idDepartamento WHERE idCiudad = :id`, 
            { nombre, idDepartamento, id }, { autoCommit: true }
        );
        res.send('Ciudad actualizada');
    } catch (e) { res.status(500).send(e.message); } 
    finally { if (conn) await conn.close(); }
});

// ==========================================
// RUTA GENÉRICA DE ELIMINACIÓN
// ==========================================
app.delete('/eliminar-geo/:tabla/:columna/:id', async (req, res) => {
    const { tabla, columna, id } = req.params;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(`DELETE FROM ${tabla} WHERE ${columna} = :id`, [id], { autoCommit: true });
        res.send('Registro eliminado correctamente');
    } catch (e) {
        if (e.message.includes("ORA-02292")) res.status(400).send("No se puede eliminar: Otros registros dependen de este.");
        else res.status(500).send("Error: " + e.message);
    } finally { if (conn) await conn.close(); }
});

// --- RUTAS PARA CLIENTE ---

app.get('/cliente', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT c.idCliente, c.idPersona, p.nombre, p.apellido 
             FROM CLIENTE c
             JOIN PERSONA p ON c.idPersona = p.idPersona`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (connection) await connection.close();
    }
});

app.post('/cliente', async (req, res) => {
    const { idPersona } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO CLIENTE (idCliente, idPersona) 
             VALUES ((SELECT NVL(MAX(idCliente), 0) + 1 FROM CLIENTE), :idPersona)`,
            { idPersona },
            { autoCommit: true }
        );
        res.status(201).send('Cliente registrado con éxito');
    } catch (error) {
        // ORA-02291 es el error de "Integridad referencial violada - llave madre no encontrada"
        if (error.message.includes("ORA-02291")) {
            res.status(400).send("Error: El ID de Persona no existe en la base de datos.");
        } else {
            res.status(500).send("Error en el servidor: " + error.message);
        }
    } finally {
        if (connection) await connection.close();
    }
});

// ELIMINAR CLIENTE
app.delete('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `DELETE FROM CLIENTE WHERE idCliente = :id`,
            [id],
            { autoCommit: true }
        );
        res.send('Cliente eliminado exitosamente');
    } catch (error) {
        res.status(500).send("Error al eliminar: " + error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// EDITAR CLIENTE
app.put('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    const { idPersona } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `UPDATE CLIENTE SET idPersona = :idPersona WHERE idCliente = :id`,
            { idPersona, id },
            { autoCommit: true }
        );
        res.send('Registro de cliente actualizado');
    } catch (error) {
        res.status(500).send("Error al actualizar: " + error.message);
    } finally {
        if (connection) await connection.close();
    }
});

// --- LOGIN (YA ESTABA BIEN) ---
app.post('/login', async (req, res) => {
    const { nombreUsuario, clave } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT IDUSUARIO, NOMBREUSUARIO, IDPERFIL FROM Usuario WHERE NOMBREUSUARIO = :nombreUsuario AND CLAVE = :clave`,
            { nombreUsuario, clave }, 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length > 0) res.json(result.rows[0]); 
        else res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno' });
    } finally {
        if (connection) await connection.close();
    }
});

app.listen(5000, () => console.log('Servidor en http://localhost:5000'));
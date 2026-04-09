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
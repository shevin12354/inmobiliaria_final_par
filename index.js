const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

oracledb.initOracleClient({ libDir: 'C:\\oracle_client' });

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'ldprogram2', // o BASE2 según donde creaste tablas
    password: '132',
    connectString: 'localhost/xe'
};

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.get('/test-db', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute('SELECT * FROM TipoPersona');

        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error("ERROR REAL:", error);
        res.status(500).send(error.message);
    }
});

app.get('/tipopersona', async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            'SELECT * FROM TipoPersona',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.post('/tipopersona', async (req, res) => {
    const { id, descripcion } = req.body;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `INSERT INTO TipoPersona (idTipoPersona, descripcion)
             VALUES (:id, :descripcion)`,
            { id, descripcion },
            { autoCommit: true }
        );

        await connection.close();

        res.send('TipoPersona creado');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.put('/tipopersona/:id', async (req, res) => {
    const { descripcion } = req.body;
    const id = req.params.id;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `UPDATE TipoPersona 
             SET descripcion = :descripcion
             WHERE idTipoPersona = :id`,
            { descripcion, id },
            { autoCommit: true }
        );

        await connection.close();

        res.send('TipoPersona actualizado');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.delete('/tipopersona/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `DELETE FROM TipoPersona WHERE idTipoPersona = :id`,
            { id },
            { autoCommit: true }
        );

        await connection.close();

        res.send('TipoPersona eliminado');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => {
    console.log('Servidor corriendo en http://localhost:5000');
});
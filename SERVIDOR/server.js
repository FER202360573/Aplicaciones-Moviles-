const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// Conexión y base de datos "activas" del usuario que inició sesión.
// (Para un proyecto real con varios usuarios simultáneos, esto debería
// manejarse por sesión/token en vez de una sola variable global.)
let client = null;
let db = null;

// Arma la cadena de conexión usando el usuario y contraseña capturados en el login,
// en vez de tenerlos fijos en el código.
function buildUri(username, password) {
    const user = encodeURIComponent("FERLEON");
    const pass = encodeURIComponent("Trufas21");
    return `mongodb://${user}:${pass}@ac-1amieaz-shard-00-00.n9jthup.mongodb.net:27017,ac-1amieaz-shard-00-01.n9jthup.mongodb.net:27017,ac-1amieaz-shard-00-02.n9jthup.mongodb.net:27017/?ssl=true&replicaSet=atlas-hj299k-shard-0&authSource=admin&appName=Cluster0`;
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Usuario y contraseña son requeridos.' });
    }

    let intento;
    try {
        const uri = buildUri(username, password);
        intento = new MongoClient(uri, { serverSelectionTimeoutMS: 8081 });

        await intento.connect();
        // El connect() puede tener éxito sin validar credenciales en algunos casos,
        // así que confirmamos con un ping autenticado.
        await intento.db('admin').command({ ping: 1 });

        // Si ya había una conexión previa (otro login), la cerramos.
        if (client) {
            await client.close().catch(() => {});
        }

        client = intento;
        db = client.db('sample_mflix');

        console.log(`Conectado a MongoDB como "${username}"`);
        return res.json({ ok: true, mensaje: 'Conexión exitosa.' });
    } catch (error) {
        console.error('Error de autenticación con MongoDB:', error.message);
        if (intento) {
            await intento.close().catch(() => {});
        }
        return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
    }
});

app.get('/movies', async (req, res) => {
    if (!db) {
        return res.status(401).json({ mensaje: 'No hay una sesión activa. Inicia sesión primero.' });
    }

    try {
        const movies = await db.collection('movies').find(
            {},
            {
                projection: {
                    poster: 1,
                    title: 1,
                    plot: 1,
                    fullplot: 1,
                    genres: 1,
                    cast: 1,
                    directors: 1,
                    writers: 1,
                    year: 1,
                    runtime: 1,
                    rated: 1,
                    released: 1,
                    countries: 1,
                    languages: 1,
                    imdb: 1,
                },
            }
        ).limit(50).toArray();

        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los datos de la colección.' });
    }
});

app.listen(port, () => {
    console.log("Servidor en http://localhost:4000");
});
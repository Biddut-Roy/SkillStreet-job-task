const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.malve12.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dbConnect = async () => {
    try {
        client.connect()
        console.log('DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect();

const takingDatabase = client.db("Task").collection("takingData");

// Create Note
app.post('/api/v1/notes', async (req, res) => {
    const note = {
        title: req.body.title,
        content: req.body.content,
        created_at: new Date(),
        updated_at: new Date()
    };

    try {
        const result = await takingDatabase.insertOne(note);
        res.send(result);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Retrieve Notes
app.get('/api/v1/notes', async (req, res) => {
    try {
        const result = await takingDatabase.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Retrieve Single Note by ID
app.get('/api/v1/notes/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    try {
        const result = await takingDatabase.findOne(query)
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Update Note
app.put('/api/v1/notes/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id)};
    const update = {
        $set:{
            content: req.body.content,
            updated_at: new Date()
        }
    }
    try {
        const result = await takingDatabase.updateOne(filter , update);
        res.send(result)
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }

});

// Delete Note
app.delete('/api/v1/notes/:id', async (req, res) => {
    const id = req.params.id;

});



app.get('/', (req, res) => {
    res.send('Welcome to my server!')
})

app.listen(port, () => {
    console.log(`star my server on port ${port}`);
})
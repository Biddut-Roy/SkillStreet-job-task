const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const { body , validationResult } = require('express-validator')
const basicAuth = require('basic-auth');
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())
app.use(bodyParser.json())


const uri = process.env.DATABASE_LOCAL

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



// Create middleware 
const validateNoteCreation = [
    body('title').trim().isLength({ min: 1, max: 80 }).withMessage('Title is required and must be between 1 and 80 characters'),
    body('content').trim().isLength({ min: 1, max: 400 }).withMessage('Content is required'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  
  const validateNoteUpdating = [
    body('content').optional().trim().isLength({ min: 1, max: 400 }).withMessage('Content is required and must be between 1 and 400 characters'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

//   Authentication
  const authenticate = (req, res, next) => {
    const unauthorized = (res) => {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    };
  
    const user = basicAuth(req);
  
    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    }
  
    // Replace 'username' and 'password' with your actual username and password
    if (user.name === 'Skill' && user.pass === 'Skill-Task') {
      return next();
    } else {
      return unauthorized(res);
    }
  };


// Create Note
app.post('/api/v1/notes',authenticate,validateNoteCreation,async(req, res) => {
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
app.get('/api/v1/notes',authenticate,async (req, res) => {
    try {
        const result = await takingDatabase.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Retrieve Single Note by ID
app.get('/api/v1/notes/:id',authenticate,async (req, res) => {
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
app.put('/api/v1/notes/:id',authenticate,validateNoteUpdating,async (req, res) => {
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
app.delete('/api/v1/notes/:id',authenticate,async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    try {
        const result = await takingDatabase.deleteOne(query);
        res.send(result)
    } catch (error) {
        res.status(500).send({error: 'Internal Server Error'});
    }

});



app.get('/', (req, res) => {
    res.send('Welcome to my server!')
})

app.listen(port, () => {
    console.log(`star my server on port ${port}`);
})
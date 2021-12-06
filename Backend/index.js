const connectMongo = require('./db');
const express = require('express');
const app = express();
const port = 80;

// Middleware:
app.use(express.json());

// Routers:
const authorizationRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');

// API Routes:
app.use('/api/auth', authorizationRouter);
app.use('/api/notes', notesRouter);

connectMongo();

app.get('/', (req, res) => {
    res.send("Home page!");
})

app.listen(port, () => {
    console.log(`NoteIt is running at port ${port}`);
})
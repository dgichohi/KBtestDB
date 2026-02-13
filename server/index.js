const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
     res.send('KBTESTER API is running');
});

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Projects');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET all documents for a project
app.get('/api/projects/:id/documents', async (req, res) => {
    try {
        const projectID = req.params.id;
        const [rows] = await db.query(
        'SELECT * FROM Documents WHERE projectID = ?',
        [projectID]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET all users (for testing)
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query(
        'SELECT userID, email, display_name, role FROM Users'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// SERVER - node index.js -- make sure you run within the folder, not the root
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

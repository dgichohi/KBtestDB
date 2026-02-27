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

// Get all documents
app.get('/api/documents', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Documents');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});
 
 
// Get a document by ID
app.get('/api/documents/:id', async (req, res) => {
    try {
        const documentID = req.params.id;  // get ID from URLthe
        const [rows] = await db.query(
            'SELECT * FROM Documents WHERE documentID = ?',
            [documentID]
        );
 
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
 
        res.json(rows[0]); // return the document by ID
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get a project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const projectID = req.params.id;  // get ID from URL
        const [rows] = await db.query(
            'SELECT * FROM Projects WHERE projectID = ?',
            [projectID]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(rows[0]); // return the project by ID
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});



//POST to create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { email, display_name, password, role } = req.body;

        if (!email || !display_name || !password) {
            return res.status(400).json({ error: 'Email, display_name, and password are required' });
        }

        const [result] = await db.query(
            'INSERT INTO Users (email, display_name, password, role) VALUES (?, ?, ?, ?)',
            [email, display_name, password, role || 'admin']
        );

        res.status(201).json({
            message: 'User created successfully',
            userID: result.insertId
        });
    } catch (err) {
        console.error(err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: 'Database error' });
    }
});


// POST to create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, date_created } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const [result] = await db.query(
      'INSERT INTO Projects (title, description, date_created) VALUES (?, ?, ?)',
      [title, description || null, date_created || null]
    );

    res.status(201).json({
      message: 'Project created successfully',
      projectID: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// POST to create a new document
app.post('/api/documents', async (req, res) => {
    try {
        const { projectID, title, file_path, date_uploaded } = req.body;

        if (!projectID || !title || !file_path || !date_uploaded) {
            return res.status(400).json({ error: 'projectID, title, file_path, and date_uploaded are required' });
        }

        const [result] = await db.query(
            'INSERT INTO Documents (projectID, title, file_path, date_uploaded) VALUES (?, ?, ?, ?)',
            [projectID, title, file_path, date_uploaded]
        );

        res.status(201).json({
            message: 'Document created successfully',
            documentID: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// DELETE a document by ID
app.delete('/api/documents/:id', async (req, res) => {
    try {
        const documentID = req.params.id;
        const [result] = await db.query(
            'DELETE FROM Documents WHERE documentID = ?',
            [documentID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE a project by ID
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const projectID = req.params.id;
        const [result] = await db.query(
            'DELETE FROM Projects WHERE projectID = ?',
            [projectID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }   
});

// DELETE a user by ID - (lowkey thik this should go lmk if you want to remove it)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userID = req.params.id;
        const [result] = await db.query(
            'DELETE FROM Users WHERE userID = ?',
            [userID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
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

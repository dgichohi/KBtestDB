const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// for getting the uploaded files publicly
app.use('/uploads', express.static('uploads'));

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

// GET all documents for a project, added file_url update
app.get('/api/projects/:id/documents', async (req, res) => {
    try {
        const projectID = req.params.id;

        const [rows] = await db.query(
            'SELECT * FROM Documents WHERE projectID = ?',
            [projectID]
        );
        const documents = rows.map(doc => ({
            ...doc,
            file_url: `${req.protocol}://${req.get('host')}${doc.file_path}`
            // This constructs the full URL to access the file based on the server's address and the stored file path
            // For example, if file_path is '/uploads/doc1.pdf' and the server is running on localhost:3001, the file_url will be 'http://localhost:3001/uploads/doc1.pdf'
            // This allows the frontend to easily access the document files using the provided URLs without needing to know the internal file storage structure
            
            // this is just for when we eventually move everything to Render 
            }));
        res.json(documents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const projectID = req.params.id;
        const [rows] = await db.query(
            'SELECT * FROM Projects WHERE projectID = ?',
            [projectID]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(rows[0]);
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

// GET all documents, now with file_url
app.get('/api/documents', async (req, res) => {
try {
    const [rows] = await db.query('SELECT * FROM Documents');

    const documents = rows.map(doc => ({
        ...doc,
        file_url: `${req.protocol}://${req.get('host')}${doc.file_path}`
    }));

    res.json(documents);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET a document by ID, now with file_url
app.get('/api/documents/:id', async (req, res) => {
    try {
        const documentID = req.params.id;

        const [rows] = await db.query(
            'SELECT * FROM Documents WHERE documentID = ?',
            [documentID]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const doc = {
            ...rows[0],
            file_url: `${req.protocol}://${req.get('host')}${rows[0].file_path}`
        };

        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// POST user (create new user)
app.post('/api/users', async (req, res) => {
    try {
        const { email, display_name, password, role } = req.body;

        if (!email || !display_name || !password) {
            return res.status(400).json({
            error: 'Email, display_name, and password are required'
            });
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

// POST project (create new project)
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, group_name, date_created } = req.body;

        if (!title) {
            return res.status(400).json({
            error: 'Project title is required'
            });
        }
        const [result] = await db.query(
            'INSERT INTO Projects (title, description, group_name, date_created) VALUES (?, ?, ?, ?)',
            [title, description || null, group_name || null, date_created || null]
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

// POST document (create new doc)
app.post('/api/documents', async (req, res) => {
    try {
        const { projectID, title, file_path, created_at } = req.body;

        if (!projectID || !title || !file_path) {
            return res.status(400).json({
            error: 'projectID, title, and file_path are required'
            });
        }

        const createdDate =
        created_at || new Date().toISOString().slice(0, 10);

        const [result] = await db.query(
            'INSERT INTO Documents (projectID, title, file_path, created_at) VALUES (?, ?, ?, ?)',
            [projectID, title, file_path, createdDate]
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


// DELETE document by ID
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

// DELETE project by ID
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

// DELETE user by ID
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

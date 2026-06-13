const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '26843545',
    database: 'jokes_db'
};

app.get('/api/jokes', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM jokes_log ORDER BY created_at DESC');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/jokes', async (req, res) => {
    try {
        const { type, title, content, video_path, status } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO jokes_log (type, title, content, video_path, status) VALUES (?, ?, ?, ?, ?)',
            [type, title, content, video_path, status]
        );
        await connection.end();
        res.json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});

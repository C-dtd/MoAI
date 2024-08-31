// server.js (또는 다른 서버 파일)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001; // 서버 포트

const db = new Pool({
    user: 'postgres.vpcdvbdktvvzrvjfyyzm',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    database: 'postgres',
    password: 'Odvv8E1iChKjwai4',
    port: 6543,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

app.use(cors());

app.get('/api/assignees', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('SELECT user_name FROM users');
        client.release();
        const assignees = result.rows.map(row => row.user_name);
        res.json(assignees);
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

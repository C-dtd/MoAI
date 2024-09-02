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
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/api/assignees', async (req, res) => {
    try {
        const result = await db.query('SELECT user_name FROM users');
        const assignees = result.rows.map(row => row.user_name);
        res.json(assignees);
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/cards', async (req, res) =>{
    try {
        const result = await db.query('select * from cards');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/newcard', async (req, res) => {
    const {id, title, content, category, data_range, start_date, end_date, assignee} = req.body;
    try {
        await db.query(
            'insert into cards values ($1, $2, $3, $4, $5, $6, $7, $8)',
            [ id, title, content, category, data_range, start_date, end_date, assignee ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.post('/api/editcard/title', async (req, res) => {
    const { id, title } = req.body;
    try {
        await db.query(
            'update cards set title=$2 where id=$1',
            [ id, title ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/editcard/text', async (req, res) => {
    const { id, content } = req.body;
    try {
        await db.query(
            'update cards set content=$2 where id=$1',
            [ id, content ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/editcard/category', async (req, res) => {
    const { id, category } = req.body;
    try {
        await db.query(
            'update cards set category=$2 where id=$1',
            [ id, category ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/editcard/date', async (req, res) => {
    const { id, dateRange, startDate, endDate } = req.body;
    try {
        await db.query(
            'update cards set date_range=$2, start_date=$3, end_date=$4 where id=$1',
            [ id, dateRange, startDate, endDate ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/editcard/assignee', async (req, res) => {
    const { id, assignee } = req.body;
    try {
        await db.query(
            'update cards set assignee=$2 where id=$1',
            [ id, assignee ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/deletecard', async (req, res) => {
    const { id } = req.body;
    try {
        await db.query(
            'delete from cards where id=$1',
            [ id ]
        );
        res.status(200).send('success');
    } catch (error) {
        console.error('Error fetching assignees:', error);
        res.status(500).send('Internal Server Error');
    }
});
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Pool } = require('pg');

// Database configuration
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

const port = 8000;

// Serve static files from 'css' and 'html' directories
app.use('/css', express.static(__dirname + '/css'));
app.use('/html', express.static(__dirname + '/html'));

// Route to serve the login page
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/html/login.html'); // Serve login.html
});

// Route to serve other static files or API endpoints
app.get('/db', async function(req, res) {
    const data = await db.query('select * from products');
    res.send(data.rows);
});

server.listen(port, function() {
    console.log('Server host in http://localhost:' + port);
});

io.on('connection', (socket) => {
    socket.on('msg', (msg) => {
        io.emit('msg', msg);
    });
});


// 지금 해야될 거
// 1. 로그인 페이지 만들기 X
// 2. 회원가입 페이지 만들고 연결
// 3. 회원가입 정보 데이터베이스 로드

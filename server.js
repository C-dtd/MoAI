const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Pool } = require('pg');
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

server.listen(port, function() {
    console.log('server host in http://localhost:' +port);
});

io.on('connection', (socket) => {
    socket.on('msg', (msg) => {
        io.emit('msg', msg);
    })
});

app.get('/', function(req, res) {
    res.sendFile(__dirname +'/chat.html');
});

app.get('/db', async function(req, res) {
    const data = await db.query('select * from products');
    res.send(data.rows);
});
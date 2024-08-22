const express =  require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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

app.use(cookieParser());
app.use(session({
    resave: true,
    // saveUninstallized: false,
    secret: 'secret'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');


const port = 8000;

server.listen(port, function() {
    console.log('server host in http://localhost:' +port);
});

io.on('connection', (socket) => {
    socket.on('msg', (msg) => {
        io.emit('msg', msg);
    })
});

app.get('/chat', function(req, res) {
    res.sendFile(__dirname +'/html/chat.html');
});

app.get('/db', async function(req, res) {
    const data = await db.query('select * from products');
    res.send(data.rows);
});

app.get('/', function(req, res) {
    // const { user } = req.session;
    // if (user) {
    //     res.render('login', { user });
    //     return;
    // }
    res.render('index.ejs');
});
app.post('/', function(req, res) {
    const { name } = req.body;
    req.session.user = name;
    console.log(req.body);
    res.redirect('/');
})
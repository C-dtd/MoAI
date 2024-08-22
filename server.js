const express =  require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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

app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninstallized: false,
    secret: 'secret'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');


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
        console.log(msg);
        const data = db.query(
            "insert into chat_logs (id, user_id, room_id, chat) values (nextval('seq_chat_id'), $1, $2, $3)",
            [msg.name, '0', msg.message]
        );
        io.emit('msg', msg);
    });
});

app.get('/chat', async function(req, res) {
    const chat_log = await db.query("select * from chat_logs where room_id='0'");
    res.render('chat.ejs', {chat_log: chat_log.rows});
});

app.get('/db', async function(req, res) {
    const data = await db.query("select * from chat_logs where room_id='0'");
    res.send(data.rows);
    data.rows.forEach((row) => {
        console.log(row);
    })
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


// 지금 해야될 거
// 1. 로그인 페이지 만들기 X
// 2. 회원가입 페이지 만들고 연결
// 3. 회원가입 정보 데이터베이스 로드
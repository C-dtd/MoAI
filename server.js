const express =  require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { log } = require('console');
const multer = require('multer');
const path = require('path');
const { v4 } = require('uuid');
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

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'secret'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

const port = 8000;

// 정적 파일들 html, css 연결 도구
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/html', express.static(__dirname + '/html'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/서류결제2', express.static(__dirname + '/서류결제2'));
app.use("/main_css", express.static(__dirname + '/main_css'));
app.use("/image", express.static(__dirname + '/image'));

// 페이지 연결 
app.get('/login', function(req, res) {
    const { user } = req.session;
    if (user) {
        res.redirect('/');
        return;
    }
    res.sendFile(__dirname + '/html/login.html'); // Serve login.html
});

app.get('/register', function(req, res){
    res.sendFile(__dirname + '/html/register.html');  // register html
})

app.get('/register_confirm', function(req, res){
    const { name } = req.session;
    if (name) {
        delete req.session.name;
        res.render('register_confirm.ejs', name );  // register html
    } else {
        res.send('error');
    }
})


app.get('/find_passwordauth', function(req, res){
    res.sendFile(__dirname + '/html/find_passwordauth.html');  // register html
})

app.get('/find_password_success', function(req, res){
    res.sendFile(__dirname + '/html/find_password_success.html');  // register html
})

app.get('/calendar', function(req, res) {
    res.render('calendar.ejs');
})

app.get('/index', function(req, res){
    res.sendFile(__dirname + '/서류결제2/index.html');  // register html
})

app.get('/main', function(req, res){
    res.sendFile(__dirname + '/main_html/main.html');  // register html
})

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Route to serve other static files or API endpoints

server.listen(port, function() {
    log('Server host in http://localhost:' + port);
});

io.on('connection', (socket) => {
    socket.on('msg', (msg) => {
        console.log(msg);
        db.query(
            "insert into chat_logs (id, user_id, room_id, chat, type) values (nextval('seq_chat_id'), $1, $2, $3, $4)",
            [msg.name, msg.room, msg.message, msg.type]
        );
        io.emit('msg', msg);
    });
});

app.get('/chat', async function(req, res) {
    const { user } = req.session;
    if (!user) {
        res.redirect('/');
    } else {
        console.log(user.user_id);
    }
    const chat_log = await db.query(
        "select * from chat_logs where room_id=$1",
        ['test_chat_room']
    );
    res.render('chat.ejs', {chat_log: chat_log.rows, user: user});
});

app.get('/db', async function(req, res) {
    const data = await db.query("select * from chat_logs where room_id='0'");
    res.send(data.rows);
    // data.rows.forEach((row) => {
    //     console.log(row);
    // });
});

app.get('/', function(req, res) {
    const { user } = req.session;
    if (user) {
        res.render('login', user);
        return;
    }
    res.send('');
});

app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    const data = await db.query(
        "select * from users where user_id=$1 and user_pw=$2",
        [ id, password ]
    );
    if (data.rows.length === 1) {
        const user_id = data.rows[0].user_id;
        const user_name = data.rows[0].user_name;
        req.session.user = { user_id, user_name };
        res.redirect('/');
    } else {
        res.redirect('#');
    }
});

app.post('/register', function(req, res) {
    const { id, name, phoneHead, phoneFront, phoneBack, password } = req.body;
    let phone = `${phoneHead}-${phoneFront}-${phoneBack}`;
    req.session.name = { name };
    db.query(
        "insert into users values ($1, $2, $3, '-', '-', $4)",
        [id, password, name, phone]
    )
    res.redirect('/register_confirm');
});

app.get('/upload_', (req, res) => {
    res.render('upload.ejs');
});

app.post('/upload', upload.single('file'), function(req, res) {
    const file = req.file;
    res.send(
        { 
            result: 'ok',
            path: file.path
        }
    );
});

app.post('/payment_req', async (req, res) => {
    const { user } = req.session;
    if (!user) {
        res.send('invalid reqeust');
        return;
    }
    const path = req.body.path;
    const id = v4();

    await db.query(
        "insert into payment (id, uploader, path) values ($1, $2, $3)",
        [ id, user.user_id, path ]
    );
    
    res.send( {uuid: id} );
});

app.post('/payment_res', upload.single('file'), async (req, res) => {
    const { user } = req.session;

    if (!user) {
        res.send('invalid request');
        return;
    }
    // console.log('payment_res');
    // console.log(req.body.uuid);
    const file = req.file;

    const data = await db.query(
        "update payment set app_at=now(), app=$1, app_path=$2 where id=$3",
        [ user.user_id, file.path, req.body.uuid ]
    );

    res.send(
        { result: 'ok'}
    );
});

app.get('/payment/:uuid', async (req, res) => {
    const { user } = req.session;
    if (!user) {
        res.send('invalid reqeust');
        return;
    }
    const id = req.params.uuid;
    const data = await db.query(
        "select * from payment where id=$1",
        [ id ]
    );
    let applied = false;
    console.log(data.rows[0].app);
    if (data.rows[0].app) {
        applied = true;
    }
    res.render('payment.ejs', { uuid: id, applied: applied })
});

app.get('/payment_file/:uuid', async (req, res) => {
    const id = req.params.uuid;
    const data = await db.query(
        "select * from payment where id=$1",
        [ id ]
    );
    if (data.rows[0].app) {
        res.download(data.rows[0].app_path);
    } else {
        res.download(data.rows[0].path);
    }
});
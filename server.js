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

// Database configuration

// const fileUpload = require('express-fileupload');
// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config(); // 환경 변수 로드

//슈퍼베이스 파일 업로드 위한 정의작업

// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// // 슈퍼베이스 파일 업로드 위한 클라이언트 setup

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
        cb(null, Date.now() +path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninstallized: false,
    secret: 'secret'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(fileUpload()); // 슈퍼베이스 파일 업로드 미들웨어 추가
app.set('view engine', 'ejs');

const port = 8000;

// 정적 파일들 html, css 연결 도구
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/html', express.static(__dirname + '/html'));
app.use('/서류결제2', express.static(__dirname + '/서류결제2'));

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

// app.post('/upload', async (req, res) => {
//     if (!req.files || !req.files.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     const file = req.files.file;
//     const fileName = `public/${file.name}`;

//     try {
//         const { data, error } = await supabase
//             .storage
//             .from('uploads') // Supabase Storage bucket name
//             .upload(fileName, file.data, {
//                 contentType: file.mimetype
//             });

//         if (error) {
//             throw error;
//         }

//         res.status(200).send('File uploaded successfully');
//     } catch (error) {
//         res.status(500).send('Error uploading file: ' + error.message);
//     }
// });
// 슈퍼베이스 업로드 위한 엔드포인트 설정하기

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Route to serve other static files or API endpoints

server.listen(port, function() {
    log('Server host in http://localhost:' + port);
});

io.on('connection', (socket) => {
    socket.on('msg', (msg) => {
        console.log(msg);
        const data = db.query(
            "insert into chat_logs (id, user_id, room_id, chat) values (nextval('seq_chat_id'), $1, $2, $3)",
            [msg.name, 'test_chat_room', msg.message]
        );
        io.emit('msg', msg);
    });
});

app.get('/chat', async function(req, res) {
    const chat_log = await db.query(
        "select * from chat_logs where room_id=$1",
        ['test_chat_room']
    );
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

app.post('/upload_', upload.single('file'), function(req, res) {
    console.log(req.file);
    res.redirect('#');
});

// 지금 해야될 거
// 1. 로그인 페이지 만들기 X
// 2. 회원가입 페이지 만들고 연결
// 3. 회원가입 정보 데이터베이스 로드
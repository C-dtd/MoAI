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

// 정적 페이지 연결 
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

app.get('/index', function(req, res){
    res.sendFile(__dirname + '/서류결제2/index.html');  // register html
})

app.get('/main', function(req, res){
    res.sendFile(__dirname + '/main_html/main.html');  // register html
})

server.listen(port, function() {
    log('Server host in http://localhost:' + port);
});

app.get('/calendar', function(req, res) {
    res.render('calendar.ejs');
})

//소켓 통신 (채팅 부분)
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

//메인 페이지
app.get('/', function(req, res) {
    const { user } = req.session;
    if (user) {
        res.render('main_iframe', user);
        return;
    }   
    res.redirect('/login');
});

//채팅페이지 (임시)
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

// app.get('/db', async function(req, res) {
//     const data = await db.query("select * from chat_logs where room_id='0'");
//     res.send(data.rows);
// });

//로그인시 아이디랑 비밀번호 확인 후 로그인 동작
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

//회원 가입시 정보 db에 저장
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

//post formdata로 파일(key: file)이 업로드될때 ./uploads에 저장. 저장된 경로 반환
app.post('/upload', upload.single('file'), function(req, res) {
    const file = req.file;
    res.send(
        {
            result: 'ok',
            path: file.path
        }
    );
});

//결재 요청 보내기
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

//결재 요청 응답
app.post('/payment_res', upload.single('file'), async (req, res) => {
    const { user } = req.session;

    if (!user) {
        res.send('invalid request');
        return;
    }
    const file = req.file;

    await db.query(
        "update payment set app_at=now(), app=$1, app_path=$2 where id=$3",
        [ user.user_id, file.path, req.body.uuid ]
    );

    res.send(
        { result: 'ok' }
    );
});

//결재 요청 url
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
    if (data.rows[0].app) {
        applied = true;
    }
    res.render('payment.ejs', { uuid: id, applied: applied })
});

//결재 요청 url의 파일 다운로드 링크
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

function dateParser(str) {
    function leftpad (str, len, ch) {
        str = String(str);
        var i = -1;
        if (!ch && ch !== 0) ch = '';
        len = len - str.length;
        while (++i < len) {
            str = ch + str;
        }
        return str;
    }

    let date = new Date(str.toString());
    let res_ = '';

    res_ += leftpad(date.getFullYear(), 4, 0) +'-';
    res_ += leftpad(date.getMonth()+1, 2, 0) +'-';
    res_ += leftpad(date.getDate(), 2, 0) +'T';
    res_ += leftpad(date.getHours(), 2, 0) +':';
    res_ += leftpad(date.getMinutes(), 2, 0) +":";
    res_ += leftpad(date.getSeconds(), 2, 0);

    return res_;
}

// 이벤트 데이터를 처리하는 API 엔드포인트
app.post('/api/events', async (req, res) => {
    console.log(req.body);
    // const { id, title, category, start, end, state, location, isReadOnly } = req.body;
    const { end, id, isAllday, isPrivate, location, start, state, title } = req.body;
    
    try {
        // PostgreSQL에 이벤트 데이터를 저장
        await db.query(
            'INSERT INTO calandars(id, user_id, start_date, end_date, title, location, isallday, state) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, 'user_id', dateParser(start.d.d), dateParser(end.d.d), title, location, isAllday, state]
            
        );

        res.status(201).json({ message: 'Event successfully saved to the database' });
    } catch (error) {
        console.error('Error saving event to the database:', error);
        res.status(500).json({ message: 'Failed to save event to the database' });
    }
});

// 데이터 삭제 엔드포인트 추가
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM calandars WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Event deleted successfully', deletedEvent: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event from the database' });
    }
});

// 데이터 수정 엔드포인트 추가
app.put('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { title, start, end, location, isAllday, state } = req.body;

    try {
        const result = await db.query(
            `UPDATE calandars
             SET title = $1, start_date = $2, end_date = $3, location = $4, isallday = $5, state = $6
             WHERE id = $7
             RETURNING *`,
            [title, dateParse(start.d.d), dateParse(end.d.d), location, isAllday, state, id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Event not found' });
        } else {
            res.status(200).json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating event in the database:', error);
        res.status(500).json({ message: 'Failed to update event in the database' });
    }
});


// 특정 사용자의 이벤트 가져오기 API
app.get('/api/events/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await db.query(
            'SELECT * FROM calandars WHERE user_id = $1',
            [user_id]
        );
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching events from the database:', error);
        res.status(500).json({ message: 'Failed to fetch events from the database' });
    }
});

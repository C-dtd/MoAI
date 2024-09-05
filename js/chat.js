const socket = io();
const cont = document.querySelector('.msg-cont');
const chat_main = document.querySelector('.main-section');
const imgInput = document.querySelector('#img-input');
const scroll = document.querySelector('.scroll');
const userMsg = document.querySelector('#msg');

chat_main.addEventListener('scroll', ()=> {
    scroll.style.top = `${chat_main.scrollTop/(chat_main.scrollHeight -chat_main.clientHeight +32) *(chat_main.scrollHeight - scroll.clientHeight +32)}px`;
});


const allowExt = ['png', 'pjp', 'jpg', 'jpeg', 'jfif', 'webp', 'bmp'];
const regURL = new RegExp("(http|https|ftp|telnet|news|irc)://([-/.a-zA-Z0-9_~#%$?&=:200-377()]+)","gi");
const room_id = window.location.href.split('/').pop();
const imgs = document.querySelectorAll('img');
imgs.forEach((img) => {
    img.addEventListener('load', () => {
        chat_main.scrollTop = chat_main.scrollHeight;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const chats = document.querySelectorAll('article>main');
    chats.forEach((chat) => {
        chat.innerHTML = chat.innerHTML.replace(regURL, "<a href='$1://$2' target='_blank'>$1://$2</a>");
    });
    socket.emit('join', room_id);
    const chatImgs = document.querySelectorAll('.chat-img');
    chatImgs.forEach((img) => {
        img.addEventListener('click', (e) => {
            parent.modalOpen(e.target.getAttribute('src'));
        });
    });
    chat_main.scrollTop = chat_main.scrollHeight;
});

socket.on('msg', async (msg) => {
    const chatbox = document.createElement('article');
    const response = await fetch('/session/user_id');
    const res = await response.text();
    // console.log(res);
    if (msg.user_id == res) {
        chatbox.className += 'my-chat';
    } else {
        chatbox.className += 'other-chat';
    }
    chatbox.className += ' ' +msg.type;
    const header = document.createElement('header');
    header.innerText = msg.user_name;
    chatbox.appendChild(header);
    
    const main = document.createElement('main');
    if (msg.type == 'text') {
        main.innerText = msg.message;
        main.innerHTML = main.innerHTML.replace(regURL, "<a class='artist-portfolio' href='$1://$2' target='_blank'>$1://$2</a>");
    } else if (msg.type == 'img') {
        const img = document.createElement('img');
        img.setAttribute('src', '/'+msg.message);
        img.className += 'chat-img';
        img.addEventListener('load', () => {
            chat_main.scrollTop = chat_main.scrollHeight;
        });
        img.addEventListener('click', (e) => {
            parent.modalOpen(e.target.getAttribute('src'));
        });
        main.appendChild(img);
    } else if (msg.type == 'payment') {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', '/payment/'+msg.message);
        anchor.setAttribute('target', '_blank');
        anchor.innerText = '결재 요청';
        main.appendChild(anchor);
    } else if (msg.type == 'calendar') {
        const message = msg.message.split('\t');
        // console.log(message);
        main.innerText = "일정을 공유했습니다.";
        const article = document.createElement('article');
        article.classList = 'contrast';
        const articleHeader = document.createElement('header');
        articleHeader.innerText = message[1];
        article.appendChild(articleHeader);
        const articleMain = document.createElement('main');
        articleMain.innerText = message[2] + ' ~ ' +message[3];
        article.appendChild(articleMain);
        main.appendChild(article);
    }
    chatbox.appendChild(main);
    cont.appendChild(chatbox);
    chat_main.scrollTop = chat_main.scrollHeight;
});

document.querySelector('#submit').addEventListener('click', message_send());

let isShift = false;

userMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        isShift = true;
    }
});
userMsg.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        isShift = false;
    }
});

userMsg.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && !isShift) {
        e.preventDefault();
        message_send();
        return;
    }
})


function message_send() {
    if (userMsg.value == '') {
        return;
    }

    socket.emit('msg', {message: userMsg.value, type: 'text', room: room_id});
    userMsg.value = '';
}

imgInput.addEventListener('input', async (e) => {
    if (!allowExt.includes(imgInput.files[0].name.split('.').pop())) {
        imgInput.value = '';
        return false;
    }

    const formData = new FormData();
    formData.append('file', imgInput.files[0]);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const res = await response.json();
    
    imgInput.value = '';
    socket.emit('msg', {message: res.path, type: 'img', room: room_id});
});


document.querySelector('#calendarShare').addEventListener('click', async () => {
    const modal = document.querySelector('#eventModal');

    let userId = await fetch('/session/user_id');
    userId = await userId.text();
    const response = await fetch(`/api/events/${userId}`);
    if (response.ok) {
        const events = await response.json();
        const eventList = document.querySelector('#event-list');
        eventList.innerHTML = '';
        events.myCalendar.forEach((event) => {
            const article = document.createElement('article');
            const header = document.createElement('header');
            header.innerText = event.cal_title;
            const main = document.createElement('main');
            main.innerText = event.cal_start_date.replace('T', ' ') + ' ~ ' + event.cal_end_date.replace('T', ' ');
            article.appendChild(header);
            article.appendChild(main);
            eventList.appendChild(article);

            article.addEventListener('click', async () => {
                const response = await fetch('/calendar/share', {
                    method: 'POST',
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        calendarId: event.cal_id,
                        roomId: room_id
                    })
                });
                if (!response.ok) {
                    location.href = '/';
                }
                socket.emit('msg', {
                    message: event.cal_id+'\t'+event.cal_title+'\t'+event.cal_start_date.replace('T', ' ')+'\t'+event.cal_end_date.replace('T', ' '),
                    type: 'calendar',
                    room: room_id,
                });
            });
        });
    }
    modal.style.display = 'flex';
});
document.querySelector('#memberInfo').addEventListener('click', () => {
    document.querySelector('#memberModal').style.display = 'flex';
});
document.querySelector('#eventModal').addEventListener('click', (e) => {
    document.querySelector('#eventModal').style.display = 'none';
});
document.querySelector('#memberModal').addEventListener('click', (e) => {
    document.querySelector('#memberModal').style.display = 'none';
});
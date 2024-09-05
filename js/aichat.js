const chat_main = document.querySelector('.main-section');
const cont = document.querySelector('.msg-cont');
const scroll = document.querySelector('.scroll');
const userMsg = document.querySelector('#msg');
const newChatButton = document.querySelector('#new-chat');

chat_main.scrollTop = chat_main.scrollHeight;

chat_main.addEventListener('scroll', ()=> {
    scroll.style.top = `${chat_main.scrollTop/(chat_main.scrollHeight -chat_main.clientHeight +32) *(chat_main.scrollHeight - scroll.clientHeight +32)}px`;
});

document.querySelector('#submit').addEventListener('click', message_send);

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
});

async function message_send() {
    const submitButton = document.querySelector('#submit');

    if (submitButton.getAttribute('aria-busy') == 'true') {
        return;
    }

    if (userMsg.value == '') {
        return;
    }

    user_input = userMsg.value;
    userMsg.value = '';
    
    const response_id = await fetch('/session/user_id');
    const user_id = await response_id.text();
    const response_name = await fetch('/session/user_name');
    const user_name = await response_name.text();

    submitButton.setAttribute('aria-busy', true);

    const chatbox = document.createElement('article');
    chatbox.className = 'my-chat';
    const header = document.createElement('header');
    header.innerText = user_name;
    chatbox.appendChild(header);
    const main = document.createElement('main');
    main.innerText = user_input;
    chatbox.appendChild(main);
    cont.appendChild(chatbox);
    chat_main.scrollTop = chat_main.scrollHeight;

    let chat_response = '';

    try {
        const response = await fetch('http://localhost:5100/chat', {
            method: 'POST',
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                user_input: user_input,
                user_id: user_id
            })
        })
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json(); 
        // console.log(data.answer);
        chat_response = data.answer;
        
    } catch (error) {
        console.error('Error:', error);
        chat_response = '서버에서 오류가 발생했습니다. :' +error; 
    }

    {
        const chatbox = document.createElement('article');
        chatbox.className = 'other-chat';
        const header = document.createElement('header');
        header.innerText = 'AI';
        chatbox.appendChild(header);
        const main = document.createElement('main');
        main.innerText = chat_response;
        chatbox.appendChild(main);
        cont.appendChild(chatbox);
        chat_main.scrollTop = chat_main.scrollHeight;

    }

    submitButton.setAttribute('aria-busy', false);
}

newChatButton.addEventListener('click', async () => {
    const response = await fetch('/aichat/reset');
    const res = await response.json();

    if (res.response == 'ok') {
        chat_main.innerHTML = '';
    }
});
const chat_main = document.querySelector('.main-section');
const cont = document.querySelector('.msg-cont');
const scroll = document.querySelector('.scroll');

chat_main.addEventListener('scroll', ()=> {
    scroll.style.top = `${chat_main.scrollTop/(chat_main.scrollHeight -chat_main.clientHeight +32) *(chat_main.scrollHeight - scroll.clientHeight +32)}px`;
});

document.querySelector('#submit').addEventListener('click', async (e) => {
    const userMsg = document.querySelector('#msg');
    const submitButton = document.querySelector('#submit');

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

        const chatbox = document.createElement('article');
        chatbox.className = 'other-chat';
        const header = document.createElement('header');
        header.innerText = 'AI';
        chatbox.appendChild(header);
        const main = document.createElement('main');
        main.innerText = data.answer;
        chatbox.appendChild(main);
        cont.appendChild(chatbox);
        chat_main.scrollTop = chat_main.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }

    submitButton.setAttribute('aria-busy', false);
});
document.querySelector('.show-password').addEventListener('click', function(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('password');
    const showPasswordButton = document.querySelector('.show-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordButton.textContent = 'hide';
    } else {
        passwordInput.type = 'password';
        showPasswordButton.textContent = 'show';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const rememberMeCheckbox = document.getElementById('remember');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const moaiTitle = document.getElementById('moai-title');

    // MoAI 클릭 시 로그인 페이지로 이동
    moaiTitle.addEventListener('click', function() {
        window.location.href = '/login';
    });
    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    if (getCookie('rememberMe') === 'true') {
        rememberMeCheckbox.checked = true;
        usernameInput.value = getCookie('username') || '';
    }

    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
    
        const formData = {
            id: usernameInput.value,
            password: passwordInput.value
        };
    
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (rememberMeCheckbox.checked) {
                    setCookie('rememberMe', 'true', 7);  // 7일 동안 유지
                    setCookie('username', usernameInput.value, 7);
                } else {
                    setCookie('rememberMe', '', -1);  // 쿠키 삭제
                    setCookie('username', '', -1);  // 쿠키 삭제
                }
                window.location.href = '/';
            } else {
                alert(data.message);  // "아이디 또는 비밀번호가 잘못되었습니다." 경고창 표시
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    
});

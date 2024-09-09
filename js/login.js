document.querySelector('#togglePassword').addEventListener('click', function(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.src = '../image/hide.png'; // 눈이 가려진 아이콘으로 변경
    } else {
        // 비밀번호가 가려진 상태면 다시 'password'로 변경
        passwordInput.type = 'password';
        togglePassword.src = '../image/show.png'; // 눈 아이콘으로 변경
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const rememberMeCheckbox = document.getElementById('remember');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const moaiTitle = document.getElementById('moai-title');
    const loginForm = document.querySelector('form');
    const alertDiv = document.querySelector('.alert');

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

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();  // 폼 기본 제출 동작 방지
    
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
                alertDiv.innerText = data.message;
                // alert(data.message);  // "아이디 또는 비밀번호가 잘못되었습니다." 경고창 표시
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Enter 키가 눌렸을 때 폼이 제출되도록 설정
    passwordInput.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // 기본 Enter 키 동작을 방지
            loginForm.dispatchEvent(new Event('submit')); // 폼 제출 이벤트 트리거
        }
    });
});

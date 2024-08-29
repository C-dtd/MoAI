document.addEventListener('DOMContentLoaded', () => {
    // 로그인 버튼 클릭 시 login.html로 이동
    document.querySelector('.login-button').addEventListener('click', function() {
        window.location.href = '/login';
    });

    // MoAI 로고 클릭 시 login.html로 이동
    document.querySelector('header.container').addEventListener('click', function() {
        window.location.href = '/login';
    });
});

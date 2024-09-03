// 로그인 버튼 클릭 시 login.html로 이동
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.login-button').addEventListener('click', function() {
        window.location.href = '/login';
    });

    const moaiTitle = document.getElementById('moai-title');

    // MoAI 클릭 시 로그인 페이지로 이동
    moaiTitle.addEventListener('click', function() {
        window.location.href = '/login';
    });
});

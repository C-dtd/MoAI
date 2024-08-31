document.querySelector('.show-password').addEventListener('click', function() {
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

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const VALID_USERNAME = 'Jessica';
    const VALID_PASSWORD = 'a15Dz6fl!';

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('username', username);
            window.location.href = 'index.html';
        } else {
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });

    usernameInput.addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });

    passwordInput.addEventListener('input', function() {
        errorMessage.style.display = 'none';
    });
});

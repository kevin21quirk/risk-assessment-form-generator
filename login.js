document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const VALID_USERNAME = 'Jessica';
    const VALID_PASSWORD_HASH = '2fa59560a1cc2d8e40127ff3c6b29bc6fab1247293b813b93df5f0d9e7f7e698';

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        const passwordHash = await hashPassword(password);

        if (username === VALID_USERNAME && passwordHash === VALID_PASSWORD_HASH) {
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

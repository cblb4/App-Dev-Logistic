document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordCheckbox = document.getElementById('togglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (togglePasswordCheckbox && passwordInput) {
        togglePasswordCheckbox.addEventListener('change', function() {
            passwordInput.type = this.checked ? 'text' : 'password';
        });
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const keepSignedInCheckbox = document.getElementById('keepSignedIn');
    const passwordToggle = document.querySelector('.password-toggle');
    const toggleText = document.querySelector('.toggle-text');
    const infoIcon = document.getElementById('infoIcon');
    const infoTooltip = document.getElementById('infoTooltip');

    // Password toggle functionality
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleText.textContent = 'Show';
            } else {
                passwordInput.type = 'password';
                toggleText.textContent = 'Hide';
            }
        });
    }

    // Info tooltip functionality
    if (infoIcon && infoTooltip) {
        infoIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (infoTooltip.classList.contains('show')) {
                infoTooltip.classList.remove('show');
            } else {
                // Position tooltip relative to the icon
                const iconRect = infoIcon.getBoundingClientRect();
                const tooltipRect = infoTooltip.getBoundingClientRect();
                
                infoTooltip.style.position = 'fixed';
                infoTooltip.style.left = Math.max(10, iconRect.left - 120) + 'px';
                infoTooltip.style.top = (iconRect.bottom + 8) + 'px';
                
                infoTooltip.classList.add('show');
            }
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', function(e) {
            if (!infoIcon.contains(e.target) && !infoTooltip.contains(e.target)) {
                infoTooltip.classList.remove('show');
            }
        });
    }

    // Form validation and submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const keepSignedIn = keepSignedInCheckbox ? keepSignedInCheckbox.checked : false;

            // Basic validation
            if (!email) {
                showError(emailInput, 'Email address or username is required');
                return;
            }

            if (!password) {
                showError(passwordInput, 'Password is required');
                return;
            }

            if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters long');
                return;
            }

            // Clear any previous errors
            clearErrors();

            // Show loading state
            const submitButton = signupForm.querySelector('.signup-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Signing in...';
            submitButton.disabled = true;

            // Simulate signup process
            setTimeout(() => {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;

                // Here you would typically send the data to your server
                console.log('Signup attempt:', {
                    email: email,
                    password: password,
                    keepSignedIn: keepSignedIn
                });

                // For demo purposes, show success message
                alert('Signup functionality would be implemented here!');
            }, 1500);
        });
    }

    // Input validation helpers
    function showError(input, message) {
        clearErrors();
        
        input.style.borderColor = '#ef4444';
        input.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.1)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.focus();
    }

    function clearErrors() {
        // Reset input styles
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = '#d1d5db';
            input.style.boxShadow = 'none';
        });

        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearErrors();
        });
    });

    // Enhanced password toggle with better UX
    let isPasswordVisible = true; // Start with password visible as shown in image
    
    if (passwordToggle) {
        // Set initial state
        passwordInput.type = 'text';
        toggleText.textContent = 'Hide';
        
        passwordToggle.addEventListener('click', function() {
            isPasswordVisible = !isPasswordVisible;
            passwordInput.type = isPasswordVisible ? 'text' : 'password';
            toggleText.textContent = isPasswordVisible ? 'Hide' : 'Show';
        });
    }
});// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const fullNameInput = document.getElementById('fullName');
    const togglePasswordCheckbox = document.getElementById('togglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const keepSignedInCheckbox = document.getElementById('keepSignedIn');
    
    // Get form switching elements
    const formTitle = document.getElementById('formTitle');
    const authButton = document.getElementById('authButton');
    const requiredNotice = document.getElementById('requiredNotice');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const emailLabel = document.getElementById('emailLabel');
    const passwordLabel = document.getElementById('passwordLabel');
    const toggleLabel = document.querySelector('.toggle-label');
    
    // Get conditional form groups
    const nameGroup = document.getElementById('nameGroup');
    const rememberMeGroup = document.getElementById('rememberMeGroup');
    const keepSignedInGroup = document.getElementById('keepSignedInGroup');
    const loginLinks = document.getElementById('loginLinks');
    
    // Current form state
    let isSignupMode = false;

    // Form switching functionality
    function switchToSignupMode() {
        isSignupMode = true;
        formTitle.textContent = 'Sign in or create an account';
        authButton.textContent = 'Sign in';
        requiredNotice.style.display = 'block';
        
        // Update labels
        emailLabel.textContent = '*User name or email address';
        passwordLabel.textContent = '*Password';
        toggleLabel.textContent = 'Hide';
        
        // Show/hide form groups
        nameGroup.style.display = 'block';
        keepSignedInGroup.style.display = 'block';
        rememberMeGroup.style.display = 'none';
        loginLinks.style.display = 'none';
        
        // Switch form links
        switchToSignup.style.display = 'none';
        switchToLogin.style.display = 'block';
        
        // Make name field required
        fullNameInput.required = true;
        
        // Set password to text type by default (as shown in image)
        passwordInput.type = 'text';
        togglePasswordCheckbox.checked = true;
    }

    function switchToLoginMode() {
        isSignupMode = false;
        formTitle.textContent = 'Log in';
        authButton.textContent = 'Log in';
        requiredNotice.style.display = 'none';
        
        // Update labels
        emailLabel.textContent = 'Email address or username';
        passwordLabel.textContent = 'Password';
        toggleLabel.textContent = 'Show Password';
        
        // Show/hide form groups
        nameGroup.style.display = 'none';
        keepSignedInGroup.style.display = 'none';
        rememberMeGroup.style.display = 'block';
        loginLinks.style.display = 'flex';
        
        // Switch form links
        switchToSignup.style.display = 'block';
        switchToLogin.style.display = 'none';
        
        // Make name field not required
        fullNameInput.required = false;
        
        // Reset password type
        passwordInput.type = 'password';
        togglePasswordCheckbox.checked = false;
    }

    // Event listeners for form switching
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToSignupMode();
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToLoginMode();
        });
    }

    // Password toggle functionality
    if (togglePasswordCheckbox && passwordInput) {
        togglePasswordCheckbox.addEventListener('change', function() {
            if (this.checked) {
                passwordInput.type = 'text';
                toggleLabel.textContent = isSignupMode ? 'Hide' : 'Hide Password';
            } else {
                passwordInput.type = 'password';
                toggleLabel.textContent = isSignupMode ? 'Show' : 'Show Password';
            }
        });
    }

    // Form validation and submission
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const fullName = fullNameInput.value.trim();
            const rememberMe = rememberMeCheckbox.checked;
            const keepSignedIn = keepSignedInCheckbox ? keepSignedInCheckbox.checked : false;

            // Basic validation
            if (isSignupMode && !fullName) {
                showError(fullNameInput, 'Full name is required');
                return;
            }

            if (!email) {
                showError(emailInput, 'Email address or username is required');
                return;
            }

            if (!password) {
                showError(passwordInput, 'Password is required');
                return;
            }

            if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters long');
                return;
            }

            // Clear any previous errors
            clearErrors();

            // Show loading state
            const originalText = authButton.textContent;
            authButton.textContent = isSignupMode ? 'Creating account...' : 'Logging in...';
            authButton.disabled = true;

            // Simulate login/signup process
            setTimeout(() => {
                // Reset button
                authButton.textContent = originalText;
                authButton.disabled = false;

                // Here you would typically send the data to your server
                console.log(isSignupMode ? 'Signup attempt:' : 'Login attempt:', {
                    email: email,
                    password: password,
                    ...(isSignupMode && { fullName: fullName }),
                    ...(isSignupMode ? { keepSignedIn: keepSignedIn } : { rememberMe: rememberMe })
                });

                // For demo purposes, show success message
                alert(`${isSignupMode ? 'Signup' : 'Login'} functionality would be implemented here!`);
            }, 1500);
        });
    }

    // Input validation helpers
    function showError(input, message) {
        clearErrors();
        
        input.style.borderColor = '#e74c3c';
        input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.focus();
    }

    function clearErrors() {
        // Reset input styles
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = '#e1e5e9';
            input.style.boxShadow = 'none';
        });

        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearErrors();
        });
    });
});
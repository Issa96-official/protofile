// Inloggningssidans JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    
    // Hantera formulärinlämning
    loginForm.addEventListener('submit', handleLogin);
    
    // Fokusera på användarnamn-fältet
    document.getElementById('username').focus();
    
    // Hantera Enter-tangent
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
            handleLogin(e);
        }
    });
});

// Theme management (samma som i main.js)
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    // Läs sparad tema från localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Ljust tema';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Mörkt tema';
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = loginBtn.querySelector('.btn-spinner');
    
    // Visa laddningsindikator
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    loginBtn.disabled = true;
    
    // Dölj tidigare felmeddelanden
    hideError();
    
    const formData = new FormData(document.getElementById('login-form'));
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    console.log('Försöker logga in med:', { username: loginData.username }); // Debug log
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('Response status:', response.status); // Debug log
        
        const result = await response.json();
        console.log('Response data:', result); // Debug log
        
        if (response.ok) {
            // Inloggning lyckades
            showSuccess('Inloggning lyckades! Omdirigerar...');
            
            // Omdirigera efter kort fördröjning
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
            
        } else {
            // Inloggning misslyckades
            if (result.errors && Array.isArray(result.errors)) {
                showError(result.errors.map(err => err.msg).join(', '));
            } else {
                showError(result.error || 'Inloggning misslyckades');
            }
        }
        
    } catch (error) {
        console.error('Inloggningsfel:', error);
        showError('Ett fel uppstod vid anslutning till servern. Kontrollera att servern körs.');
    } finally {
        // Återställ knapp
        btnText.style.display = 'inline-block';
        btnSpinner.style.display = 'none';
        loginBtn.disabled = false;
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.background = '#d4edda';
    errorMessage.style.color = '#155724';
    errorMessage.style.borderColor = '#c3e6cb';
}

// Visuella förbättringar
function addVisualEffects() {
    // Lägg till focus-effekter på input-fält
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
        
        // Kontrollera om fältet redan har värde
        if (input.value) {
            input.parentNode.classList.add('focused');
        }
    });
    
    // Lägg till hover-effekt på inloggningsknapp
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-2px)';
        }
    });
    
    loginBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// CSS för focus-effekter
const style = document.createElement('style');
style.textContent = `
    .form-group.focused label {
        color: #667eea;
        transform: translateY(-2px);
    }
    
    .form-group.focused input {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
    }
    
    .login-card {
        animation: fadeInUp 0.8s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Validering i realtid
function addRealTimeValidation() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    
    function validateForm() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        const isValid = username.length > 0 && password.length > 0;
        
        loginBtn.disabled = !isValid;
        
        if (isValid) {
            loginBtn.classList.remove('disabled');
        } else {
            loginBtn.classList.add('disabled');
        }
    }
    
    usernameInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);
    
    // Initial validering
    validateForm();
}

// Kör alla förbättringar när sidan laddats
window.addEventListener('load', function() {
    addVisualEffects();
    addRealTimeValidation();
});

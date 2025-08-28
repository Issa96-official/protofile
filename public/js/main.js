// Huvudsidans JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadProfile();
});

// Theme management
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
            themeText.textContent = 'الوضع النهاري';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'الوضع الليلي';
        }
    }
}

async function loadProfile() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء جلب بيانات الملف الشخصي');
        }
        
        const data = await response.json();
        
        // Uppdatera profil
        updateProfile(data.profile);
        
        // Uppdatera sociala medielänkar
        updateSocialLinks(data.social_links);
        
        // Dölj laddning
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Fel vid laddning av profil:', error);
        
        // Visa felmeddelande
        if (errorElement) {
            errorElement.style.display = 'block';
        }
        
        // Dölj laddning
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

function updateProfile(profile) {
    const nameElement = document.getElementById('profile-name');
    const imageElement = document.getElementById('profile-image');
    
    if (nameElement && profile.name) {
        nameElement.textContent = profile.name;
    }
    
    if (imageElement && profile.profile_image) {
        imageElement.src = profile.profile_image;
        imageElement.alt = `${profile.name || 'Profil'}s bild`;
    }
}

function updateSocialLinks(links) {
    const container = document.getElementById('social-links');
    
    if (!container) return;
    
    if (!links || links.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; font-style: italic;">Inga sociala medielänkar har lagts till än.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = 'social-link';
        
        // Bestäm ikon baserat på plattform
        let iconClass = link.icon_class || getDefaultIcon(link.platform);
        
        linkElement.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${link.platform}</span>
        `;
        
        // Lägg till hover-effekt med plattformsfärg
        linkElement.addEventListener('mouseenter', function() {
            const color = getPlatformColor(link.platform);
            if (color) {
                this.style.borderColor = color;
            }
        });
        
        linkElement.addEventListener('mouseleave', function() {
            this.style.borderColor = 'transparent';
        });
        
        container.appendChild(linkElement);
    });
}

function getDefaultIcon(platform) {
    const icons = {
        'Facebook': 'fab fa-facebook',
        'Instagram': 'fab fa-instagram',
        'Twitter': 'fab fa-twitter',
        'LinkedIn': 'fab fa-linkedin',
        'YouTube': 'fab fa-youtube',
        'TikTok': 'fab fa-tiktok',
        'GitHub': 'fab fa-github',
        'Website': 'fas fa-globe',
        'Email': 'fas fa-envelope',
        'Other': 'fas fa-link'
    };
    
    return icons[platform] || 'fas fa-link';
}

function getPlatformColor(platform) {
    const colors = {
        'Facebook': '#1877f2',
        'Instagram': '#e4405f',
        'Twitter': '#1da1f2',
        'LinkedIn': '#0077b5',
        'YouTube': '#ff0000',
        'TikTok': '#000000',
        'GitHub': '#333333',
        'Website': '#667eea',
        'Email': '#ea4335',
        'Other': '#6c757d'
    };
    
    return colors[platform];
}

// Animationer och visuella effekter
function addVisualEffects() {
    // Lägg till parallax-effekt på bakgrund
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('body');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            parallax.style.backgroundPosition = `center ${speed}px`;
        }
    });
    
    // Lägg till klick-animation på sociala länkar
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Skapa ripple-effekt
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// CSS för ripple-effekt
const style = document.createElement('style');
style.textContent = `
    .social-link {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Kör visuella effekter när sidan laddats
window.addEventListener('load', addVisualEffects);

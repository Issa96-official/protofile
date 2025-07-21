// Admin-panelens JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeTabs();
    initializeModals();
    initializeForms();
    loadAdminData();
    
    // Event listeners
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('add-link-btn').addEventListener('click', () => openSocialLinkModal());
});

// Theme management (samma som i andra filer)
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

// Flikar
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Ta bort aktiv klass från alla flikar
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Lägg till aktiv klass till aktuell flik
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// Modaler
function initializeModals() {
    const modal = document.getElementById('social-link-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-modal');
    
    closeBtn.addEventListener('click', closeSocialLinkModal);
    cancelBtn.addEventListener('click', closeSocialLinkModal);
    
    // Stäng modal vid klick utanför
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeSocialLinkModal();
        }
    });
    
    // Stäng modal med Escape-tangent
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeSocialLinkModal();
        }
    });
}

// Formulär
function initializeForms() {
    // Profilformulär
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    
    // Social länk-formulär
    document.getElementById('social-link-form').addEventListener('submit', handleSocialLinkSave);
    
    // Lösenordsformulär
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
    
    // Fil-uppladdning förhandsvisning
    document.getElementById('profile-image-input').addEventListener('change', previewProfileImage);
    
    // Plattform-val auto-fyll ikon
    document.getElementById('platform').addEventListener('change', autoFillIcon);
}

// Ladda admin-data
async function loadAdminData() {
    await Promise.all([
        loadProfileData(),
        loadSocialLinks()
    ]);
}

async function loadProfileData() {
    try {
        const response = await fetch('/api/admin/profile');
        if (!response.ok) throw new Error('Fel vid hämtning av profildata');
        
        const profile = await response.json();
        
        document.getElementById('profile-name').value = profile.name || '';
        
        if (profile.profile_image) {
            document.getElementById('current-profile-image').src = profile.profile_image;
        }
        
    } catch (error) {
        console.error('Fel vid laddning av profildata:', error);
        showNotification('Fel vid laddning av profildata', 'error');
    }
}

async function loadSocialLinks() {
    try {
        const response = await fetch('/api/admin/social-links');
        if (!response.ok) throw new Error('Fel vid hämtning av sociala länkar');
        
        const links = await response.json();
        displaySocialLinks(links);
        
    } catch (error) {
        console.error('Fel vid laddning av sociala länkar:', error);
        showNotification('Fel vid laddning av sociala länkar', 'error');
    }
}

function displaySocialLinks(links) {
    const container = document.getElementById('social-links-list');
    
    if (links.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic; padding: 40px;">Inga sociala medielänkar har lagts till än. Klicka på "Lägg till länk" för att komma igång.</p>';
        return;
    }
    
    container.innerHTML = links.map(link => `
        <div class="social-link-item">
            <div class="social-link-info">
                <div class="social-link-icon">
                    <i class="${link.icon_class || getDefaultIcon(link.platform)}"></i>
                </div>
                <div class="social-link-details">
                    <h4>${link.platform}</h4>
                    <p>${link.url}</p>
                    <div style="margin-top: 5px;">
                        <span class="status-badge ${link.is_active ? 'active' : 'inactive'}">
                            ${link.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <span style="margin-left: 10px; font-size: 0.8rem; color: #6c757d;">
                            Ordning: ${link.display_order}
                        </span>
                    </div>
                </div>
            </div>
            <div class="social-link-actions">
                <button class="btn btn-primary btn-small" onclick="editSocialLink(${link.id})">
                    <i class="fas fa-edit"></i> Redigera
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteSocialLink(${link.id})">
                    <i class="fas fa-trash"></i> Ta bort
                </button>
            </div>
        </div>
    `).join('');
}

// Profiluppdatering
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const btn = document.getElementById('save-profile-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    showButtonLoading(btn, btnText, btnSpinner);
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/admin/profile', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Profil uppdaterad!', 'success');
            
            // Uppdatera förhandsvisning om ny bild laddades upp
            const fileInput = document.getElementById('profile-image-input');
            if (fileInput.files.length > 0) {
                await loadProfileData(); // Ladda om för att få den nya bilden
            }
        } else {
            throw new Error(result.error || 'Fel vid uppdatering av profil');
        }
        
    } catch (error) {
        console.error('Fel vid uppdatering av profil:', error);
        showNotification(error.message, 'error');
    } finally {
        hideButtonLoading(btn, btnText, btnSpinner);
    }
}

// Social länk-hantering
function openSocialLinkModal(linkData = null) {
    const modal = document.getElementById('social-link-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('social-link-form');
    
    if (linkData) {
        title.textContent = 'Redigera Social Medielänk';
        populateSocialLinkForm(linkData);
    } else {
        title.textContent = 'Lägg till Social Medielänk';
        form.reset();
        document.getElementById('link-id').value = '';
        document.getElementById('is-active').checked = true;
    }
    
    modal.classList.add('show');
    document.getElementById('platform').focus();
}

function closeSocialLinkModal() {
    document.getElementById('social-link-modal').classList.remove('show');
}

function populateSocialLinkForm(linkData) {
    document.getElementById('link-id').value = linkData.id;
    document.getElementById('platform').value = linkData.platform;
    document.getElementById('url').value = linkData.url;
    document.getElementById('icon-class').value = linkData.icon_class || '';
    document.getElementById('display-order').value = linkData.display_order;
    document.getElementById('is-active').checked = linkData.is_active;
}

async function handleSocialLinkSave(e) {
    e.preventDefault();
    
    const btn = document.getElementById('save-link-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    showButtonLoading(btn, btnText, btnSpinner);
    
    const formData = new FormData(e.target);
    const linkId = formData.get('id');
    
    const linkData = {
        platform: formData.get('platform'),
        url: formData.get('url'),
        icon_class: formData.get('icon_class'),
        display_order: parseInt(formData.get('display_order')) || 0,
        is_active: formData.get('is_active') === 'on'
    };
    
    try {
        let response;
        if (linkId) {
            // Uppdatera befintlig länk
            response = await fetch(`/api/admin/social-links/${linkId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(linkData)
            });
        } else {
            // Skapa ny länk
            response = await fetch('/api/admin/social-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(linkData)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(linkId ? 'Länk uppdaterad!' : 'Länk tillagd!', 'success');
            closeSocialLinkModal();
            await loadSocialLinks();
        } else {
            if (result.errors) {
                throw new Error(result.errors.map(err => err.msg).join(', '));
            } else {
                throw new Error(result.error || 'Fel vid sparande av länk');
            }
        }
        
    } catch (error) {
        console.error('Fel vid sparande av länk:', error);
        showNotification(error.message, 'error');
    } finally {
        hideButtonLoading(btn, btnText, btnSpinner);
    }
}

async function editSocialLink(id) {
    try {
        const response = await fetch('/api/admin/social-links');
        if (!response.ok) throw new Error('Fel vid hämtning av länkdata');
        
        const links = await response.json();
        const link = links.find(l => l.id === id);
        
        if (link) {
            openSocialLinkModal(link);
        } else {
            throw new Error('Länk hittades inte');
        }
        
    } catch (error) {
        console.error('Fel vid redigering av länk:', error);
        showNotification('Fel vid redigering av länk', 'error');
    }
}

async function deleteSocialLink(id) {
    if (!confirm('Är du säker på att du vill ta bort denna länk?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/social-links/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Länk borttagen!', 'success');
            await loadSocialLinks();
        } else {
            throw new Error(result.error || 'Fel vid borttagning av länk');
        }
        
    } catch (error) {
        console.error('Fel vid borttagning av länk:', error);
        showNotification(error.message, 'error');
    }
}

// Lösenordsändring
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const btn = document.getElementById('change-password-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    const formData = new FormData(e.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showNotification('Lösenorden matchar inte', 'error');
        return;
    }
    
    showButtonLoading(btn, btnText, btnSpinner);
    
    const passwordData = {
        currentPassword: formData.get('currentPassword'),
        newPassword: newPassword
    };
    
    try {
        const response = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Lösenord ändrat!', 'success');
            e.target.reset();
        } else {
            if (result.errors) {
                throw new Error(result.errors.map(err => err.msg).join(', '));
            } else {
                throw new Error(result.error || 'Fel vid ändring av lösenord');
            }
        }
        
    } catch (error) {
        console.error('Fel vid ändring av lösenord:', error);
        showNotification(error.message, 'error');
    } finally {
        hideButtonLoading(btn, btnText, btnSpinner);
    }
}

// Utloggning
async function handleLogout() {
    if (!confirm('Är du säker på att du vill logga ut?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        
        if (response.ok) {
            showNotification('Utloggning lyckades', 'success');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } else {
            throw new Error('Fel vid utloggning');
        }
        
    } catch (error) {
        console.error('Fel vid utloggning:', error);
        showNotification('Fel vid utloggning', 'error');
    }
}

// Hjälpfunktioner
function previewProfileImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('current-profile-image').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function autoFillIcon() {
    const platform = document.getElementById('platform').value;
    const iconInput = document.getElementById('icon-class');
    
    if (!iconInput.value && platform) {
        iconInput.value = getDefaultIcon(platform);
    }
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

function showButtonLoading(btn, btnText, btnSpinner) {
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
}

function hideButtonLoading(btn, btnText, btnSpinner) {
    btn.disabled = false;
    btnText.style.display = 'inline-block';
    btnSpinner.style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    // Ställ in ikon baserat på typ
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    icon.className = `notification-icon ${icons[type] || icons.info}`;
    messageEl.textContent = message;
    
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Dölj efter 5 sekunder
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Hantera formulärvalidering i realtid
function addRealTimeValidation() {
    // Social länk-formulär validering
    const socialForm = document.getElementById('social-link-form');
    const inputs = socialForm.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateSocialLinkForm();
        });
        
        input.addEventListener('change', function() {
            validateSocialLinkForm();
        });
    });
    
    function validateSocialLinkForm() {
        const platform = document.getElementById('platform').value;
        const url = document.getElementById('url').value;
        const saveBtn = document.getElementById('save-link-btn');
        
        const isValid = platform && url && isValidUrl(url);
        saveBtn.disabled = !isValid;
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Lägg till realtidsvalidering när sidan laddats
window.addEventListener('load', addRealTimeValidation);

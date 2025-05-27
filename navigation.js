// Shared Navigation JavaScript
// This file handles navigation between pages and maintains active states

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    setupNavigationHandlers();
    setActiveNavItem();
    setupMobileMenu();
}

function setupNavigationHandlers() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const navText = this.querySelector('span').textContent;
            
            // Handle specific navigation cases
            switch(navText) {
                case 'Dashboard':
                    if (window.location.pathname.includes('drivers.html')) {
                        // Coming from drivers page, navigate to dashboard
                        window.location.href = 'dashboard.html';
                        return;
                    }
                    break;
                    
                case 'Driver':
                case 'Users':
                    // Navigate to drivers page
                    window.location.href = 'drivers.html';
                    return;
                    
                case 'Package':
                    // Navigate to package page (when implemented)
                    showComingSoon('Package');
                    e.preventDefault();
                    return;
                    
                case 'Delivery':
                    // Navigate to delivery page (when implemented)
                    showComingSoon('Delivery');
                    e.preventDefault();
                    return;
                    
                case 'Verify Identity':
                    // Navigate to verify identity page (when implemented)
                    showComingSoon('Verify Identity');
                    e.preventDefault();
                    return;
                    
                case 'Settings':
                    // Navigate to settings page (when implemented)
                    showComingSoon('Settings');
                    e.preventDefault();
                    return;
                    
                case 'Log Out':
                    // Handle logout
                    handleLogout();
                    e.preventDefault();
                    return;
            }
            
            // If it's a placeholder link (#), prevent default
            if (href === '#') {
                e.preventDefault();
                showComingSoon(navText);
            }
            
            // Close mobile menu if open
            closeMobileMenu();
        });
    });
}

function setActiveNavItem() {
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    // Remove all active classes first
    navItems.forEach(item => item.classList.remove('active'));
    
    // Set active based on current page
    if (currentPage.includes('dashboard.html') || currentPage === '/' || currentPage === '/index.html') {
        // Dashboard page
        const dashboardItem = document.querySelector('.nav-link[href="dashboard.html"]')?.parentElement;
        if (dashboardItem) dashboardItem.classList.add('active');
    } else if (currentPage.includes('drivers.html')) {
        // Drivers page
        const driversItem = document.querySelector('.nav-link[href="drivers.html"]')?.parentElement;
        if (driversItem) driversItem.classList.add('active');
    }
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('open');
            }
        });
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
    }
}

function showComingSoon(pageName) {
    // Create and show a toast notification
    showToast(`${pageName} page is coming soon!`, 'info');
}

function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        // Show loading screen
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 16px; background: #f8fafc;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #00B69B;"></i>
                <p style="color: #64748b;">Signing out...</p>
            </div>
        `;
        
        // Simulate logout process
        setTimeout(() => {
            // Redirect to login page or clear session
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Shared toast notification function
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
        <button class="toast-close">×</button>
    `;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getToastColor(type),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: '3000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        minWidth: '300px',
        maxWidth: '400px'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        closeToast(toast);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            closeToast(toast);
        }
    }, duration);
}

function closeToast(toast) {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getToastColor(type) {
    const colors = {
        success: '#00B69B',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// Make functions available globally
window.showToast = showToast;
window.handleLogout = handleLogout;

console.log('🧭 Navigation system initialized!');
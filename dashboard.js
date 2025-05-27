document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const rowsPerPage = 6;
    let allTableData = [];
    
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const searchInput = document.querySelector('.search-input');
    const notificationIcon = document.querySelector('.notification-icon');
    const userProfile = document.querySelector('.user-profile');
    const filterInputs = document.querySelectorAll('.filter-input');
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    const monthSelector = document.querySelector('.month-selector');
    const navLinks = document.querySelectorAll('.nav-link');

    init();

    function init() {
        setupEventListeners();
        collectTableData();
        animateStats();
        updatePaginationInfo(tableRows.length);
        updatePagination();
        showWelcomeMessage();
    }

    function setupEventListeners() {
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }

        document.addEventListener('click', handleOutsideClick);

        window.addEventListener('resize', handleResize);

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performSearch(this.value.trim());
                }, 300);
            });

            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    clearSearch();
                }
            });
        }

        if (notificationIcon) {
            notificationIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleNotificationDropdown();
            });
        }

        if (userProfile) {
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleUserDropdown();
            });
        }

        let filterTimeout;
        filterInputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(() => {
                    applyFilters();
                }, 300);
            });
        });

        tableRows.forEach(row => {
            row.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return;
                selectTableRow(this);
            });
        });

        paginationBtns.forEach(btn => {
            btn.addEventListener('click', handlePaginationClick);
        });

        if (monthSelector) {
            monthSelector.addEventListener('change', function() {
                updateChart(this.value);
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });

        document.addEventListener('keydown', handleKeyboardShortcuts);

        document.addEventListener('click', closeDropdowns);
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    function handleOutsideClick(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    }

    function handleResize() {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('open');
        }
    }

    function performSearch(query) {
        if (!query) {
            clearSearch();
            return;
        }

        const visibleRows = Array.from(tableRows).filter(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(query.toLowerCase());
            row.style.display = shouldShow ? '' : 'none';
            return shouldShow;
        });

        updatePaginationInfo(visibleRows.length, query);
        currentPage = 1;
        updatePagination();
    }

    function clearSearch() {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        updatePaginationInfo(tableRows.length);
        currentPage = 1;
        updatePagination();
    }

    function applyFilters() {
        const filters = {
            customer: getInputValue('Enter Customer Name'),
            orderNumber: getInputValue('Enter order number'),
            startDate: getInputValue('Start Date', 'date'),
            endDate: getInputValue('End Date', 'date')
        };

        const visibleRows = Array.from(tableRows).filter(row => {
            const cells = row.cells;
            const orderNum = cells[0].textContent.toLowerCase();
            const date = cells[1].textContent;
            const customer = cells[2].textContent.toLowerCase();

            let shouldShow = true;

            if (filters.customer && !customer.includes(filters.customer.toLowerCase())) {
                shouldShow = false;
            }

            if (filters.orderNumber && !orderNum.includes(filters.orderNumber.toLowerCase())) {
                shouldShow = false;
            }

            if (filters.startDate || filters.endDate) {
                const rowDate = parseDate(date);
                
                if (filters.startDate && rowDate < new Date(filters.startDate)) {
                    shouldShow = false;
                }
                
                if (filters.endDate && rowDate > new Date(filters.endDate)) {
                    shouldShow = false;
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            return shouldShow;
        });

        updatePaginationInfo(visibleRows.length);
        currentPage = 1;
        updatePagination();
    }

    function getInputValue(placeholder, type = 'text') {
        const input = type === 'date' 
            ? document.querySelector(`input[type="date"]${placeholder.includes('Start') ? ':first-of-type' : ':last-of-type'}`)
            : document.querySelector(`input[placeholder="${placeholder}"]`);
        return input ? input.value : '';
    }

    function parseDate(dateString) {
        const parts = dateString.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function collectTableData() {
        allTableData = Array.from(tableRows).map(row => {
            return Array.from(row.cells).map(cell => cell.textContent.trim());
        });
    }

    function selectTableRow(row) {
        const orderNumber = row.querySelector('.order-link').textContent;
        
        tableRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        showOrderDetails(orderNumber);
    }

    function showOrderDetails(orderNumber) {
        showToast(`Viewing details for ${orderNumber}`, 'info');
        console.log('Order details for:', orderNumber);
    }

    // Pagination functions
    function handlePaginationClick() {
        if (this.disabled) return;

        if (this.classList.contains('prev')) {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
            }
        } else if (this.classList.contains('next')) {
            const totalPages = Math.ceil(getVisibleRows().length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
            }
        } else {
            currentPage = parseInt(this.textContent);
            updatePagination();
        }
    }

    function getVisibleRows() {
        return Array.from(tableRows).filter(row => row.style.display !== 'none');
    }

    function updatePagination() {
        const visibleRows = getVisibleRows();
        const totalPages = Math.ceil(visibleRows.length / rowsPerPage);

        // Show/hide rows based on current page
        visibleRows.forEach((row, index) => {
            const shouldShow = index >= (currentPage - 1) * rowsPerPage && 
                             index < currentPage * rowsPerPage;
            row.style.display = shouldShow ? '' : 'none';
        });

        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        const pageBtn = document.querySelector('.pagination-btn:not(.prev):not(.next)');

        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
        if (pageBtn) {
            pageBtn.textContent = currentPage;
            pageBtn.classList.add('active');
        }

        const start = Math.min((currentPage - 1) * rowsPerPage + 1, visibleRows.length);
        const end = Math.min(currentPage * rowsPerPage, visibleRows.length);
        updatePaginationInfo(visibleRows.length, '', start, end);
    }

    function updatePaginationInfo(totalCount, searchQuery = '', start = 1, end = Math.min(rowsPerPage, totalCount)) {
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            if (searchQuery) {
                paginationInfo.textContent = `Showing ${totalCount} results for "${searchQuery}"`;
            } else {
                paginationInfo.textContent = `Showing ${start} to ${end} of ${totalCount} entries`;
            }
        }
    }

    function toggleNotificationDropdown() {
        removeExistingDropdown('.notification-dropdown');

        const dropdown = createNotificationDropdown();
        positionDropdown(dropdown, notificationIcon);
        document.body.appendChild(dropdown);

        // Add click handlers
        dropdown.addEventListener('click', function(e) {
            if (e.target.closest('.notification-item')) {
                e.target.closest('.notification-item').classList.remove('unread');
                updateNotificationBadge();
            }
        });
    }

    function createNotificationDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown fade-in';
        dropdown.innerHTML = `
            <div class="notification-header">
                <h4>Notifications</h4>
                <span class="notification-count">2 new</span>
            </div>
            <div class="notification-list">
                <div class="notification-item unread">
                    <div class="notification-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="notification-content">
                        <p class="notification-title">New delivery assigned</p>
                        <p class="notification-text">Order #AHGA68 has been assigned to you</p>
                        <span class="notification-time">5 minutes ago</span>
                    </div>
                </div>
                <div class="notification-item unread">
                    <div class="notification-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="notification-content">
                        <p class="notification-title">Profile update required</p>
                        <p class="notification-text">Please update your driver information</p>
                        <span class="notification-time">1 hour ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="notification-content">
                        <p class="notification-title">Delivery completed</p>
                        <p class="notification-text">Order #AHGA67 delivered successfully</p>
                        <span class="notification-time">2 hours ago</span>
                    </div>
                </div>
            </div>
            <div class="notification-footer">
                <a href="#" class="view-all-btn">View all notifications</a>
            </div>
        `;
        return dropdown;
    }

    function toggleUserDropdown() {
        removeExistingDropdown('.user-dropdown');

        const dropdown = createUserDropdown();
        positionDropdown(dropdown, userProfile);
        document.body.appendChild(dropdown);

        dropdown.addEventListener('click', function(e) {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                e.preventDefault();
                const text = item.querySelector('span').textContent;
                
                if (item.classList.contains('logout')) {
                    handleLogout();
                } else {
                    handleUserMenuAction(text);
                }
                
                dropdown.remove();
            }
        });
    }

    function createUserDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown fade-in';
        dropdown.innerHTML = `
            <div class="user-dropdown-header">
                <img src="images/profile.jpg" alt="John Doe" class="dropdown-avatar">
                <div class="dropdown-user-info">
                    <span class="dropdown-user-name">John Doe</span>
                    <span class="dropdown-user-role">Admin</span>
                </div>
            </div>
            <div class="user-dropdown-menu">
                <a href="#" class="dropdown-item">
                    <i class="fas fa-user"></i>
                    <span>Profile Settings</span>
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-cog"></i>
                    <span>Account Settings</span>
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-bell"></i>
                    <span>Notifications</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-question-circle"></i>
                    <span>Help & Support</span>
                </a>
                <a href="#" class="dropdown-item logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                </a>
            </div>
        `;
        return dropdown;
    }

    function removeExistingDropdown(selector) {
        const existingDropdown = document.querySelector(selector);
        if (existingDropdown) {
            existingDropdown.remove();
            return true;
        }
        return false;
    }

    function positionDropdown(dropdown, trigger) {
        const rect = trigger.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (rect.bottom + 10) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.style.zIndex = '2000';
    }

    function closeDropdowns(e) {
        if (!e.target.closest('.notification-icon, .notification-dropdown')) {
            document.querySelectorAll('.notification-dropdown').forEach(d => d.remove());
        }
        
        if (!e.target.closest('.user-profile, .user-dropdown')) {
            document.querySelectorAll('.user-dropdown').forEach(d => d.remove());
        }
    }

    function updateChart(month) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; color: #64748b;">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading ${month} data...
                </div>
            `;
            
            setTimeout(() => {
                chartContainer.innerHTML = `
                    <div style="color: #64748b; font-style: italic; text-align: center;">
                        <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px; display: block; color: #00B69B;"></i>
                        Chart for ${month} would be rendered here<br>
                        <small>Integration with Chart.js, D3.js, or other charting library</small>
                    </div>
                `;
            }, 1000);
        }
    }

   // NEW CODE - This is the fix
function handleNavigation(e) {
    const navText = this.querySelector('span').textContent;
    
    // NEW: Check if it's the Driver button
    if (navText === 'Driver' || navText === 'Users') {
        // Instead of showing placeholder, go to real page
        window.location.href = 'driver.html';
        return;
    }
    
    // Only show placeholders for pages that don't exist yet
    if (href === '#') {
        e.preventDefault();
        navigateToPage(navText); // Only for unimplemented pages
    }
}

    function showLoadingState(container, message) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px; flex-direction: column; gap: 16px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #00B69B;"></i>
                <p style="color: #64748b;">${message}</p>
            </div>
        `;
    }

    function showPlaceholderPage(container, pageName) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-construction" style="font-size: 64px; color: #e2e8f0; margin-bottom: 24px;"></i>
                <h2 style="color: #1e293b; margin-bottom: 16px;">${pageName} Page</h2>
                <p style="color: #64748b; margin-bottom: 24px;">This page is under construction.</p>
                <button onclick="location.reload()" style="padding: 12px 24px; background: #00B69B; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
                    Back to Dashboard
                </button>
            </div>
        `;
    }

    function handleUserMenuAction(action) {
        console.log('User action:', action);
        showToast(`${action} functionality would be implemented here`, 'info');
    }

    function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 16px; background: #f8fafc;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #00B69B;"></i>
                    <p style="color: #64748b;">Signing out...</p>
                </div>
            `;
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    function updateNotificationBadge() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    function showToast(message, type = 'info', duration = 3000) {
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

    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    const target = entry.target;
                    const finalValue = target.textContent;
                    
                    // Extract number from text
                    const numericValue = parseInt(finalValue.replace(/[$,]/g, ''));
                    
                    if (!isNaN(numericValue)) {
                        target.classList.add('animated');
                        animateValue(target, 0, numericValue, 1500, finalValue.includes('$'));
                    }
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(num => observer.observe(num));
    }

    function animateValue(element, start, end, duration, isCurrency = false) {
        const startTime = performance.now();
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (end - start) * easeOutQuart);
            
            let displayValue = current.toLocaleString();
            if (isCurrency) {
                displayValue = '$' + displayValue;
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    }

    function handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        if (e.key === 'Escape') {
            document.querySelectorAll('.notification-dropdown, .user-dropdown').forEach(d => d.remove());
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            handleTableNavigation(e);
        }
    }

    function handleTableNavigation(e) {
        const selectedRow = document.querySelector('.data-table tbody tr.selected');
        const visibleRows = getVisibleRows().filter(row => row.style.display !== 'none');
        
        if (visibleRows.length > 0) {
            e.preventDefault();
            let newIndex = 0;
            
            if (selectedRow) {
                const currentIndex = visibleRows.indexOf(selectedRow);
                newIndex = e.key === 'ArrowDown' 
                    ? Math.min(currentIndex + 1, visibleRows.length - 1)
                    : Math.max(currentIndex - 1, 0);
            }
            
            tableRows.forEach(r => r.classList.remove('selected'));
            visibleRows[newIndex].classList.add('selected');
            visibleRows[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function showWelcomeMessage() {
        setTimeout(() => {
            showToast('Welcome to Express Dashboard! 🚀', 'success');
        }, 1000);
    }

    function exportData(format = 'csv') {
        const data = allTableData;
        const headers = ['Order Number', 'Date', 'Customer', 'Time', 'Amount', 'Destination'];
        
        if (format === 'csv') {
            const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
            downloadFile(csvContent, 'dashboard-data.csv', 'text/csv');
        } else if (format === 'json') {
            const jsonData = data.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            downloadFile(JSON.stringify(jsonData, null, 2), 'dashboard-data.json', 'application/json');
        }
        
        showToast(`Data exported as ${format.toUpperCase()}`, 'success');
    }

    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function startAutoRefresh(interval = 5 * 60 * 1000) {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('Auto-refreshing dashboard data...');
                showToast('Data refreshed', 'info', 2000);
                // pwede guro ka mag add diri ug actual na logic jod idk
            }
        }, interval);
    }
    function logPerformance() {
        if (window.performance) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`Dashboard loaded in ${loadTime}ms`);
        }
    }
    window.dashboardDebug = {
        exportData,
        showToast,
        toggleSidebar,
        performSearch,
        applyFilters,
        startAutoRefresh
    };
    logPerformance();
    console.log('🎉 Dashboard initialized successfully!');
    console.log('💡 Available debug functions: window.dashboardDebug');
});
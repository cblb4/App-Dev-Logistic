// Drivers Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Empty drivers data - will be populated when drivers are added manually
    const driversData = [];

    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredDrivers = [...driversData];
    let nextDriverId = 1; // Start from 1 since array is empty
    
    // File storage for drivers
    const driverFiles = new Map();
    
    // DOM Elements
    const driversTableBody = document.getElementById('driversTableBody');
    const selectAllCheckbox = document.getElementById('selectAll');
    const addDriverBtn = document.getElementById('addDriverBtn');
    const driverModal = document.getElementById('driverModal');
    const closeModalBtn = document.getElementById('closeModal');
    const removeUserBtn = document.getElementById('removeUserBtn');
    const searchInput = document.querySelector('.search-input');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Add Driver Modal Elements
    const addDriverModal = document.getElementById('addDriverModal');
    const closeAddDriverModalBtn = document.getElementById('closeAddDriverModal');
    const addDriverForm = document.getElementById('addDriverForm');
    const cancelAddDriverBtn = document.getElementById('cancelAddDriver');
    
    // Document Viewer Modal Elements
    const documentViewerModal = document.getElementById('documentViewerModal');
    const closeDocumentViewerBtn = document.getElementById('closeDocumentViewer');
    const viewDocumentsBtn = document.getElementById('viewDocumentsBtn');

    // Initialize
    init();

    function init() {
        setupEventListeners();
        renderDriversTable();
        updatePagination();
        setupFileUploads();
    }

    function setupEventListeners() {
        // Add driver button
        if (addDriverBtn) {
            addDriverBtn.addEventListener('click', showAddDriverModal);
        }

        // Modal close buttons
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeDriverModal);
        }
        
        if (closeAddDriverModalBtn) {
            closeAddDriverModalBtn.addEventListener('click', closeAddDriverModal);
        }
        
        if (cancelAddDriverBtn) {
            cancelAddDriverBtn.addEventListener('click', closeAddDriverModal);
        }

        if (closeDocumentViewerBtn) {
            closeDocumentViewerBtn.addEventListener('click', closeDocumentViewer);
        }

        // Modal overlay clicks
        if (driverModal) {
            driverModal.addEventListener('click', function(e) {
                if (e.target === driverModal) {
                    closeDriverModal();
                }
            });
        }
        
        if (addDriverModal) {
            addDriverModal.addEventListener('click', function(e) {
                if (e.target === addDriverModal) {
                    closeAddDriverModal();
                }
            });
        }

        if (documentViewerModal) {
            documentViewerModal.addEventListener('click', function(e) {
                if (e.target === documentViewerModal) {
                    closeDocumentViewer();
                }
            });
        }

        // Remove user button
        if (removeUserBtn) {
            removeUserBtn.addEventListener('click', handleRemoveUser);
        }

        // View documents button
        if (viewDocumentsBtn) {
            viewDocumentsBtn.addEventListener('click', function() {
                const driverId = parseInt(removeUserBtn.dataset.driverId);
                showDocumentViewer(driverId);
            });
        }

        // Select all checkbox
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', handleSelectAll);
        }

        // Search functionality
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    handleSearch(this.value.trim());
                }, 300);
            });
        }

        // Pagination
        if (prevBtn) {
            prevBtn.addEventListener('click', () => changePage(currentPage - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => changePage(currentPage + 1));
        }

        // Add Driver Form
        if (addDriverForm) {
            addDriverForm.addEventListener('submit', handleAddDriverSubmit);
        }

        // Escape key to close modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDriverModal();
                closeAddDriverModal();
                closeDocumentViewer();
            }
        });
    }

    function renderDriversTable() {
        if (!driversTableBody) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageDrivers = filteredDrivers.slice(startIndex, endIndex);

        if (pageDrivers.length === 0) {
            driversTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No drivers found</h3>
                        <p>Try adjusting your search criteria or add a new driver.</p>
                    </td>
                </tr>
            `;
            return;
        }

        driversTableBody.innerHTML = pageDrivers.map((driver, index) => `
            <tr class="driver-row" data-driver-id="${driver.id}">
                <td>
                    <input type="checkbox" class="row-checkbox" data-driver-id="${driver.id}">
                </td>
                <td>${startIndex + index + 1}</td>
                <td>
                    <div class="driver-info">
                        <img src="${driver.avatar}" alt="${driver.name}" class="driver-avatar" 
                             onerror="this.src='https://via.placeholder.com/40/00B69B/white?text=${driver.name.charAt(0)}'">
                        <div class="driver-details">
                            <div class="driver-name">${driver.name}</div>
                            <div class="driver-email">${driver.email}</div>
                        </div>
                    </div>
                </td>
                <td>${driver.contactVisible}</td>
                <td>${driver.civilStatus}</td>
                <td>${driver.joinedDate}</td>
                <td>${driver.lastLogin}</td>
                <td>
                    <div class="status-dropdown">
                        <select class="status-select" data-driver-id="${driver.id}" value="${driver.status}">
                            <option value="active" ${driver.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${driver.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to new elements
        setupTableEventListeners();
    }

    function setupTableEventListeners() {
        // Row checkboxes
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleRowSelect);
        });

        // Driver rows - click to view details
        document.querySelectorAll('.driver-row').forEach(row => {
            row.addEventListener('click', function(e) {
                if (e.target.type === 'checkbox' || e.target.classList.contains('status-select')) {
                    return;
                }
                const driverId = parseInt(this.dataset.driverId);
                showDriverModal(driverId);
            });
        });

        // Status selects
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', function(e) {
                e.stopPropagation();
                const driverId = parseInt(this.dataset.driverId);
                const newStatus = this.value;
                updateDriverStatus(driverId, newStatus);
            });
        });
    }

    function updateDriverStatus(driverId, newStatus) {
        const driver = driversData.find(d => d.id === driverId);
        if (driver) {
            const oldStatus = driver.status;
            driver.status = newStatus;
            
            // Update filtered drivers as well
            const filteredDriver = filteredDrivers.find(d => d.id === driverId);
            if (filteredDriver) {
                filteredDriver.status = newStatus;
            }
            
            showToast(`Driver status updated from ${oldStatus} to ${newStatus}`, 'success');
            console.log(`Driver ${driver.name} status changed from ${oldStatus} to ${newStatus}`);
        }
    }

    function handleSelectAll() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        updateSelectedCount();
    }

    function handleRowSelect() {
        updateSelectedCount();
        updateSelectAllState();
    }

    function updateSelectedCount() {
        const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
        console.log(`Selected drivers: ${selectedCount}`);
    }

    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        
        if (checkedBoxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === checkboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    function handleSearch(query) {
        if (!query) {
            filteredDrivers = [...driversData];
        } else {
            filteredDrivers = driversData.filter(driver => 
                driver.name.toLowerCase().includes(query.toLowerCase()) ||
                driver.email.toLowerCase().includes(query.toLowerCase()) ||
                driver.contactNumber.includes(query) ||
                driver.civilStatus.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        currentPage = 1;
        renderDriversTable();
        updatePagination();
    }

    function showDriverModal(driverId) {
        const driver = driversData.find(d => d.id === driverId);
        if (!driver) return;

        // Update modal content
        document.getElementById('modalDriverAvatar').src = driver.avatar;
        document.getElementById('modalDriverName').textContent = driver.name;
        document.getElementById('modalUserId').textContent = driver.userId;
        document.getElementById('modalContactNumber').textContent = driver.contactVisible;
        document.getElementById('modalCivilStatus').textContent = driver.civilStatus;
        document.getElementById('modalEmail').textContent = driver.email;
        document.getElementById('modalLastLogin').textContent = driver.lastLogin;

        // Show modal
        driverModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Store current driver ID for remove action
        removeUserBtn.dataset.driverId = driverId;
    }

    function closeDriverModal() {
        driverModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Add Driver Modal Functions
    function showAddDriverModal() {
        addDriverModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        resetAddDriverForm();
    }

    function closeAddDriverModal() {
        addDriverModal.classList.remove('show');
        document.body.style.overflow = '';
        resetAddDriverForm();
    }

    function resetAddDriverForm() {
        if (addDriverForm) {
            addDriverForm.reset();
        }
        
        // Reset photo preview
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            photoPreview.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>No photo selected</span>
            `;
            photoPreview.classList.remove('has-image');
        }
        
        // Reset remove photo button
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        if (removePhotoBtn) {
            removePhotoBtn.style.display = 'none';
        }
        
        // Reset file info displays
        ['resumeInfo', 'licenseInfo', 'otherInfo'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                element.innerHTML = '';
            }
        });
    }

    function setupFileUploads() {
        // Profile photo upload - FIXED
        const profilePhotoInput = document.getElementById('profilePhoto');
        const photoPreview = document.getElementById('photoPreview');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // FIXED: Use img tag for proper display
                            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
                            photoPreview.classList.add('has-image');
                            removePhotoBtn.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                    } else {
                        showToast('Please select a valid image file', 'error');
                        profilePhotoInput.value = '';
                    }
                }
            });
        }
        
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', function() {
                profilePhotoInput.value = '';
                photoPreview.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>No photo selected</span>
                `;
                photoPreview.classList.remove('has-image');
                removePhotoBtn.style.display = 'none';
            });
        }

        // Document uploads
        setupDocumentUpload('resumeFile', 'resumeInfo', ['pdf', 'doc', 'docx']);
        setupDocumentUpload('licenseFile', 'licenseInfo', ['pdf', 'jpg', 'jpeg', 'png']);
        setupDocumentUpload('otherFiles', 'otherInfo', [], true); // Allow all files, multiple
        
        // Drag and drop for file upload areas
        document.querySelectorAll('.file-upload-area').forEach(area => {
            const input = area.querySelector('input[type="file"]');
            
            area.addEventListener('click', () => input.click());
            
            area.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('dragover');
            });
            
            area.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
            });
            
            area.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    function setupDocumentUpload(inputId, infoId, allowedExtensions = [], multiple = false) {
        const input = document.getElementById(inputId);
        const info = document.getElementById(infoId);
        
        if (!input || !info) return;
        
        input.addEventListener('change', function(e) {
            const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
            
            if (files.length === 0 || !files[0]) {
                info.style.display = 'none';
                return;
            }
            
            // Validate file types if restrictions exist
            if (allowedExtensions.length > 0) {
                const invalidFiles = files.filter(file => {
                    const extension = file.name.split('.').pop().toLowerCase();
                    return !allowedExtensions.includes(extension);
                });
                
                if (invalidFiles.length > 0) {
                    showToast(`Invalid file type. Allowed: ${allowedExtensions.join(', ').toUpperCase()}`, 'error');
                    input.value = '';
                    info.style.display = 'none';
                    return;
                }
            }
            
            // Validate file size (5MB max)
            const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                showToast('File size must be less than 5MB', 'error');
                input.value = '';
                info.style.display = 'none';
                return;
            }
            
            // Display file info
            info.innerHTML = files.map((file, index) => `
                <div class="file-details">
                    <div>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${formatFileSize(file.size)})</span>
                    </div>
                    <button type="button" class="remove-file-btn" onclick="removeFile('${inputId}', ${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
            info.style.display = 'block';
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function handleAddDriverSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(addDriverForm);
        
        // Create new driver object
        const newDriver = {
            id: nextDriverId++,
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            email: formData.get('email'),
            avatar: 'https://via.placeholder.com/40/00B69B/white?text=' + formData.get('firstName').charAt(0),
            contactNumber: formData.get('contactNumber'),
            contactVisible: '09**********', // Always hide initially
            civilStatus: formData.get('civilStatus') || 'Single',
            joinedDate: new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            }),
            lastLogin: 'Never',
            status: 'active',
            userId: generateUserId(),
            role: 'Rider',
            description: "New driver added to the Express delivery team.",
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            address: formData.get('address'),
            city: formData.get('city'),
            province: formData.get('province'),
            zipCode: formData.get('zipCode'),
            dateOfBirth: formData.get('dateOfBirth')
        };
        
        // Add to drivers data with file storage
        driversData.push(newDriver);
        storeDriverFiles(newDriver.id, formData);
        filteredDrivers = [...driversData];
        
        // Update table
        renderDriversTable();
        updatePagination();
        
        // Close modal and show success message
        closeAddDriverModal();
        showToast(`${newDriver.name} has been added successfully!`, 'success');
        
        console.log('New driver added:', newDriver);
    }

    function storeDriverFiles(driverId, formData) {
        const files = {
            profilePhoto: null,
            resume: null,
            license: null,
            other: []
        };
        
        // Store profile photo
        const profilePhoto = formData.get('profilePhoto');
        if (profilePhoto && profilePhoto.size > 0) {
            files.profilePhoto = {
                file: profilePhoto,
                url: URL.createObjectURL(profilePhoto),
                name: profilePhoto.name,
                type: profilePhoto.type
            };
            
            // Update driver avatar with actual photo
            const driver = driversData.find(d => d.id === driverId);
            if (driver) {
                driver.avatar = files.profilePhoto.url;
            }
        }
        
        // Store resume
        const resumeFile = formData.get('resumeFile');
        if (resumeFile && resumeFile.size > 0) {
            files.resume = {
                file: resumeFile,
                url: URL.createObjectURL(resumeFile),
                name: resumeFile.name,
                type: resumeFile.type
            };
        }
        
        // Store license
        const licenseFile = formData.get('licenseFile');
        if (licenseFile && licenseFile.size > 0) {
            files.license = {
                file: licenseFile,
                url: URL.createObjectURL(licenseFile),
                name: licenseFile.name,
                type: licenseFile.type
            };
        }
        
        // Store other files
        const otherFiles = formData.getAll('otherFiles');
        otherFiles.forEach(file => {
            if (file && file.size > 0) {
                files.other.push({
                    file: file,
                    url: URL.createObjectURL(file),
                    name: file.name,
                    type: file.type
                });
            }
        });
        
        driverFiles.set(driverId, files);
    }

    function showDocumentViewer(driverId) {
        const files = driverFiles.get(driverId);
        const documentTabs = document.getElementById('documentTabs');
        const documentContent = document.getElementById('documentContent');
        
        if (!files || (!files.resume && !files.license && files.other.length === 0)) {
            // Show no documents message
            documentTabs.innerHTML = '';
            documentContent.innerHTML = `
                <div class="no-document">
                    <i class="fas fa-file-slash"></i>
                    <h3>No documents uploaded</h3>
                    <p>This driver hasn't uploaded any documents yet.</p>
                </div>
            `;
            documentViewerModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            return;
        }
        
        // Create tabs
        let tabs = '';
        let content = '';
        let activeTab = '';
        
        if (files.resume) {
            activeTab = activeTab || 'resume';
            tabs += `<button class="document-tab ${activeTab === 'resume' ? 'active' : ''}" onclick="showDocTab('resume')">Resume/CV</button>`;
            content += `
                <div class="document-preview ${activeTab === 'resume' ? 'active' : ''}" id="resume-preview">
                    ${createDocumentPreview(files.resume)}
                </div>
            `;
        }
        
        if (files.license) {
            activeTab = activeTab || 'license';
            tabs += `<button class="document-tab ${activeTab === 'license' ? 'active' : ''}" onclick="showDocTab('license')">Driver's License</button>`;
            content += `
                <div class="document-preview ${activeTab === 'license' ? 'active' : ''}" id="license-preview">
                    ${createDocumentPreview(files.license)}
                </div>
            `;
        }
        
        if (files.other.length > 0) {
            activeTab = activeTab || 'other';
            tabs += `<button class="document-tab ${activeTab === 'other' ? 'active' : ''}" onclick="showDocTab('other')">Other Documents</button>`;
            const otherContent = files.other.map((file, index) => `
                <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h4 style="margin: 0 0 12px 0;">${file.name}</h4>
                    ${createDocumentPreview(file)}
                </div>
            `).join('');
            content += `
                <div class="document-preview ${activeTab === 'other' ? 'active' : ''}" id="other-preview">
                    ${otherContent}
                </div>
            `;
        }
        
        documentTabs.innerHTML = tabs;
        documentContent.innerHTML = content;
        
        // Show modal
        documentViewerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function createDocumentPreview(fileData) {
        const { url, name, type } = fileData;
        
        if (type.startsWith('image/')) {
            return `
                <div style="text-align: center;">
                    <img src="${url}" alt="${name}" style="max-width: 100%; max-height: 60vh; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <br>
                    <button class="download-btn" onclick="downloadFile('${url}', '${name}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
        } else if (type === 'application/pdf') {
            return `
                <div style="text-align: center;">
                    <iframe src="${url}" style="width: 100%; height: 60vh; border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>
                    <br>
                    <button class="download-btn" onclick="downloadFile('${url}', '${name}')">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="no-document">
                    <i class="fas fa-file"></i>
                    <h4>${name}</h4>
                    <p>Preview not available for this file type</p>
                    <button class="download-btn" onclick="downloadFile('${url}', '${name}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
        }
    }

    function closeDocumentViewer() {
        documentViewerModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function generateUserId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }

    function handleRemoveUser() {
        const driverId = parseInt(removeUserBtn.dataset.driverId);
        handleRemoveDriver(driverId);
        closeDriverModal();
    }

    function handleRemoveDriver(driverId) {
        const driver = driversData.find(d => d.id === driverId);
        if (!driver) return;

        if (confirm(`Are you sure you want to remove ${driver.name}?`)) {
            // Remove from data array
            const index = driversData.findIndex(d => d.id === driverId);
            if (index > -1) {
                driversData.splice(index, 1);
                filteredDrivers = driversData.filter(driver => 
                    !searchInput.value.trim() || 
                    driver.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                    driver.email.toLowerCase().includes(searchInput.value.toLowerCase())
                );
                
                // Remove stored files
                driverFiles.delete(driverId);
                
                renderDriversTable();
                updatePagination();
                showToast(`${driver.name} has been removed successfully`, 'success');
            }
        }
    }

    function changePage(page) {
        const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderDriversTable();
        updatePagination();
    }

    function updatePagination() {
        const totalItems = filteredDrivers.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${totalItems} entries`;
        }

        // Update pagination buttons
        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages;
        }

        // Update page number button
        const pageBtn = document.querySelector('.pagination-btn:not(.prev):not(.next)');
        if (pageBtn) {
            pageBtn.textContent = currentPage;
        }
    }

    // Utility functions
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Copied to clipboard!', 'success');
        });
    }

    function toggleVisibility(elementId) {
        const element = document.getElementById(elementId);
        const button = element.parentNode.querySelector('.toggle-visibility-btn i');
        
        if (elementId === 'modalContactNumber') {
            const driverId = parseInt(removeUserBtn.dataset.driverId);
            const driver = driversData.find(d => d.id === driverId);
            
            if (element.textContent.includes('*')) {
                element.textContent = driver.contactNumber;
                button.className = 'fas fa-eye-slash';
            } else {
                element.textContent = driver.contactVisible;
                button.className = 'fas fa-eye';
            }
        }
    }

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

    // Make functions available globally for HTML onclick handlers
    window.copyToClipboard = copyToClipboard;
    window.toggleVisibility = toggleVisibility;
    
    // Make download function available globally
    window.downloadFile = function(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Make document tab function available globally
    window.showDocTab = function(tabName) {
        document.querySelectorAll('.document-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.document-preview').forEach(p => p.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabName + '-preview').classList.add('active');
    };
    
    // Make removeFile function available globally
    window.removeFile = function(inputId, fileIndex) {
        const input = document.getElementById(inputId);
        const info = document.getElementById(inputId.replace('File', 'Info'));
        
        if (input && info) {
            // For single file inputs, just clear
            if (!input.multiple) {
                input.value = '';
                info.style.display = 'none';
                return;
            }
            
            // For multiple file inputs, remove specific file
            const dt = new DataTransfer();
            const files = Array.from(input.files);
            
            files.forEach((file, index) => {
                if (index !== fileIndex) {
                    dt.items.add(file);
                }
            });
            
            input.files = dt.files;
            input.dispatchEvent(new Event('change'));
        }
    };

    // Debug functions
    window.driversDebug = {
        showDriverModal,
        handleRemoveDriver,
        showToast,
        driversData,
        showAddDriverModal,
        closeAddDriverModal,
        showDocumentViewer,
        driverFiles
    };

    console.log('🚗 Drivers page initialized successfully!');
    console.log('💡 Available debug functions: window.driversDebug');
    console.log('✅ Add Driver modal functionality ready!');
    console.log('📄 Document viewer functionality ready!');
    console.log('🔒 Contact numbers hidden by default!');
    console.log('📸 Image upload fixed!');
    console.log('🎯 Starting with empty drivers data - ready for manual additions!');
});
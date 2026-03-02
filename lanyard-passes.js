if (!sessionStorage.getItem('authenticated')) {
    window.location.href = 'index.html';
}

let editMode = false;

document.addEventListener('DOMContentLoaded', function() {
    const editModeBtn = document.getElementById('editModeBtn');
    const addPassBtn = document.getElementById('addPassBtn');
    const removePassBtn = document.getElementById('removePassBtn');
    const printBtn = document.getElementById('printBtn');
    const switchToRiskBtn = document.getElementById('switchToRiskBtn');
    const switchToCertBtn = document.getElementById('switchToCertBtn');
    const switchToCleaningBtn = document.getElementById('switchToCleaningBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passesContainer = document.getElementById('passesContainer');

    editModeBtn.addEventListener('click', toggleEditMode);
    addPassBtn.addEventListener('click', addPass);
    removePassBtn.addEventListener('click', removePass);
    printBtn.addEventListener('click', printPasses);
    switchToRiskBtn.addEventListener('click', () => window.location.href = 'app.html');
    switchToCertBtn.addEventListener('click', () => window.location.href = 'certificate.html');
    switchToCleaningBtn.addEventListener('click', () => window.location.href = 'cleaning-assessment.html');
    const switchToAuditBtn = document.getElementById('switchToAuditBtn');
    switchToAuditBtn.addEventListener('click', () => window.location.href = 'audit-trail.html');
    logoutBtn.addEventListener('click', logout);

    initializePhotoUploads();

    function initializePhotoUploads() {
        const photoSections = document.querySelectorAll('.pass-photo');
        
        photoSections.forEach(photoSection => {
            const fileInput = photoSection.querySelector('.photo-upload');
            const photoImage = photoSection.querySelector('.photo-image');
            const placeholder = photoSection.querySelector('.photo-placeholder');
            
            // Click on placeholder or image to trigger file input
            placeholder.addEventListener('click', () => {
                fileInput.click();
            });
            
            photoImage.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Handle file selection
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        photoImage.src = event.target.result;
                        photoImage.style.display = 'inline-block';
                        placeholder.style.display = 'none';
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    }

    function toggleEditMode() {
        editMode = !editMode;
        
        if (editMode) {
            document.body.classList.add('edit-mode');
            editModeBtn.textContent = 'Disable Edit Mode';
            editModeBtn.classList.remove('btn-primary');
            editModeBtn.classList.add('btn-secondary');
            
            const editableElements = document.querySelectorAll('.editable-content');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'true');
            });
        } else {
            document.body.classList.remove('edit-mode');
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.classList.remove('btn-secondary');
            editModeBtn.classList.add('btn-primary');
            
            const editableElements = document.querySelectorAll('.editable-content');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'false');
            });
        }
    }

    function addPass() {
        const currentPasses = passesContainer.querySelectorAll('.pass-wrapper').length;
        
        if (currentPasses >= 4) {
            alert('Maximum of 4 passes per A4 sheet. Please print this page and create a new set if you need more passes.');
            return;
        }
        
        const newPass = document.createElement('div');
        newPass.className = 'pass-wrapper';
        newPass.innerHTML = `
            <div class="pass">
                <div class="pass-header">
                    <h2 class="editable-content" contenteditable="${editMode}">ABBEY HEALTHCARE</h2>
                    <p class="pass-type editable-content" contenteditable="${editMode}">CONTRACTOR PASS</p>
                </div>
                
                <div class="pass-photo">
                    <input type="file" class="photo-upload no-print" accept="image/*" style="display: none;">
                    <img class="photo-image" style="display: none;">
                    <div class="photo-placeholder">PHOTO<br><small class="no-print" style="font-size: 0.7em;">Click to upload</small></div>
                </div>
                
                <div class="pass-info">
                    <div class="info-row">
                        <span class="label">Name:</span>
                        <span class="value editable-content" contenteditable="${editMode}">_______________________</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Service:</span>
                        <span class="value editable-content" contenteditable="${editMode}">_______________________</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Company:</span>
                        <span class="value editable-content" contenteditable="${editMode}">_______________________</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Valid From:</span>
                        <span class="value editable-content" contenteditable="${editMode}">___________</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Valid Until:</span>
                        <span class="value editable-content" contenteditable="${editMode}">___________</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Care Home:</span>
                        <span class="value editable-content" contenteditable="${editMode}">Applecroft Care Home</span>
                    </div>
                </div>
                
                <div class="pass-footer">
                    <p class="editable-content" contenteditable="${editMode}">This pass must be worn visibly at all times</p>
                    <p class="editable-content" contenteditable="${editMode}">Report to reception on arrival</p>
                </div>
            </div>
        `;
        passesContainer.appendChild(newPass);
        initializePhotoUploads();
    }

    function removePass() {
        const passes = passesContainer.querySelectorAll('.pass-wrapper');
        if (passes.length > 1) {
            passesContainer.removeChild(passes[passes.length - 1]);
        } else {
            alert('You must have at least one pass on the page.');
        }
    }

    function printPasses() {
        window.print();
    }
});

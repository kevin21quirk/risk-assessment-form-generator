if (!sessionStorage.getItem('authenticated')) {
    window.location.href = 'index.html';
}

let editMode = false;
let boxCounter = 1;

document.addEventListener('DOMContentLoaded', function() {
    const editModeBtn = document.getElementById('editModeBtn');
    const addBoxBtn = document.getElementById('addBoxBtn');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const switchToRiskBtn = document.getElementById('switchToRiskBtn');
    const switchToCertBtn = document.getElementById('switchToCertBtn');
    const switchToCleaningBtn = document.getElementById('switchToCleaningBtn');
    const switchToLanyardBtn = document.getElementById('switchToLanyardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const auditContent = document.getElementById('auditContent');

    editModeBtn.addEventListener('click', toggleEditMode);
    addBoxBtn.addEventListener('click', addBoxEntry);
    saveTemplateBtn.addEventListener('click', saveAsTemplate);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    switchToRiskBtn.addEventListener('click', () => window.location.href = 'app.html');
    switchToCertBtn.addEventListener('click', () => window.location.href = 'certificate.html');
    switchToCleaningBtn.addEventListener('click', () => window.location.href = 'cleaning-assessment.html');
    switchToLanyardBtn.addEventListener('click', () => window.location.href = 'lanyard-passes.html');
    logoutBtn.addEventListener('click', logout);

    loadTemplates();
    generateAuditRefNumber();
    
    // Try to load saved audit data first
    const savedData = loadAuditData();
    
    if (savedData) {
        // Restore saved data
        restoreAuditData(savedData);
    } else {
        // Add 10 initial empty rows for immediate use (users can add more with "Add Box Entry" button)
        for (let i = 0; i < 10; i++) {
            addBoxEntry();
        }
    }
    
    updateSummary();

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    }

    function generateAuditRefNumber() {
        const year = new Date().getFullYear();
        let auditCounter = localStorage.getItem('auditCounter_' + year);
        
        if (!auditCounter) {
            auditCounter = 1;
        } else {
            auditCounter = parseInt(auditCounter) + 1;
        }
        
        localStorage.setItem('auditCounter_' + year, auditCounter);
        
        const refNumber = year + '-' + String(auditCounter).padStart(4, '0');
        document.getElementById('auditRefNumber').textContent = refNumber;
    }

    function toggleEditMode() {
        editMode = !editMode;
        
        if (editMode) {
            auditContent.classList.add('edit-mode');
            editModeBtn.textContent = 'Disable Edit Mode';
            editModeBtn.classList.remove('btn-primary');
            editModeBtn.classList.add('btn-secondary');
            
            const editableElements = auditContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'true');
            });
        } else {
            auditContent.classList.remove('edit-mode');
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.classList.remove('btn-secondary');
            editModeBtn.classList.add('btn-primary');
            
            const editableElements = auditContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'false');
            });
        }
    }

    function addBoxEntry() {
        const tableBody = document.getElementById('auditTableBody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="Box ${boxCounter}" class="box-number"></td>
            <td>
                <select class="box-category">
                    <option value="">Select...</option>
                    <option value="HR">HR</option>
                    <option value="Residents">Residents</option>
                    <option value="Admin">Admin</option>
                    <option value="Misc">Misc</option>
                </select>
            </td>
            <td><input type="text" placeholder="Brief description" class="box-description"></td>
            <td><input type="text" placeholder="e.g., 2020-2022" class="box-daterange"></td>
            <td style="text-align: center;"><input type="checkbox" class="box-scanned"></td>
            <td style="text-align: center;"><input type="checkbox" class="box-shredded"></td>
            <td><input type="text" placeholder="Additional notes" class="box-notes"></td>
            <td class="no-print" style="text-align: center;">
                <button class="btn btn-delete" onclick="deleteBoxEntry(this)">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
        boxCounter++;
        
        // Add event listeners to update summary in real-time
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        const categorySelect = row.querySelector('.box-category');
        const textInputs = row.querySelectorAll('input[type="text"]');
        
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                updateSummary();
                saveAuditData();
            });
        });
        categorySelect.addEventListener('change', () => {
            updateSummary();
            saveAuditData();
        });
        textInputs.forEach(input => {
            input.addEventListener('input', () => {
                updateSummary();
                saveAuditData();
            });
            input.addEventListener('change', () => {
                updateSummary();
                saveAuditData();
            });
        });
        
        updateSummary();
    }

    window.deleteBoxEntry = function(button) {
        if (confirm('Are you sure you want to delete this box entry?')) {
            button.closest('tr').remove();
            updateSummary();
            saveAuditData();
        }
    };

    function updateSummary() {
        const rows = document.querySelectorAll('#auditTableBody tr');
        
        let totalBoxes = rows.length;
        let totalScanned = 0;
        let totalShredded = 0;
        let totalBoth = 0;
        
        let hrCount = 0, hrScanned = 0, hrShredded = 0;
        let residentsCount = 0, residentsScanned = 0, residentsShredded = 0;
        let adminCount = 0, adminScanned = 0, adminShredded = 0;
        let miscCount = 0, miscScanned = 0, miscShredded = 0;
        
        rows.forEach(row => {
            const categorySelect = row.querySelector('.box-category');
            const scannedCheckbox = row.querySelector('.box-scanned');
            const shreddedCheckbox = row.querySelector('.box-shredded');
            
            if (!categorySelect || !scannedCheckbox || !shreddedCheckbox) return;
            
            const category = categorySelect.value;
            const scanned = scannedCheckbox.checked;
            const shredded = shreddedCheckbox.checked;
            
            if (scanned) totalScanned++;
            if (shredded) totalShredded++;
            if (scanned && shredded) totalBoth++;
            
            // Category breakdown - only count if a category is selected
            if (category === 'HR') {
                hrCount++;
                if (scanned) hrScanned++;
                if (shredded) hrShredded++;
            } else if (category === 'Residents') {
                residentsCount++;
                if (scanned) residentsScanned++;
                if (shredded) residentsShredded++;
            } else if (category === 'Admin') {
                adminCount++;
                if (scanned) adminScanned++;
                if (shredded) adminShredded++;
            } else if (category === 'Misc') {
                miscCount++;
                if (scanned) miscScanned++;
                if (shredded) miscShredded++;
            }
        });
        
        // Update summary cards
        const totalBoxesEl = document.getElementById('totalBoxes');
        const totalScannedEl = document.getElementById('totalScanned');
        const totalShreddedEl = document.getElementById('totalShredded');
        const totalBothEl = document.getElementById('totalBoth');
        
        if (totalBoxesEl) totalBoxesEl.textContent = totalBoxes;
        if (totalScannedEl) totalScannedEl.textContent = totalScanned;
        if (totalShreddedEl) totalShreddedEl.textContent = totalShredded;
        if (totalBothEl) totalBothEl.textContent = totalBoth;
        
        // Update category breakdown
        const hrCountEl = document.getElementById('hrCount');
        const hrScannedEl = document.getElementById('hrScanned');
        const hrShreddedEl = document.getElementById('hrShredded');
        
        if (hrCountEl) hrCountEl.textContent = hrCount;
        if (hrScannedEl) hrScannedEl.textContent = hrScanned;
        if (hrShreddedEl) hrShreddedEl.textContent = hrShredded;
        
        const residentsCountEl = document.getElementById('residentsCount');
        const residentsScannedEl = document.getElementById('residentsScanned');
        const residentsShreddedEl = document.getElementById('residentsShredded');
        
        if (residentsCountEl) residentsCountEl.textContent = residentsCount;
        if (residentsScannedEl) residentsScannedEl.textContent = residentsScanned;
        if (residentsShreddedEl) residentsShreddedEl.textContent = residentsShredded;
        
        const adminCountEl = document.getElementById('adminCount');
        const adminScannedEl = document.getElementById('adminScanned');
        const adminShreddedEl = document.getElementById('adminShredded');
        
        if (adminCountEl) adminCountEl.textContent = adminCount;
        if (adminScannedEl) adminScannedEl.textContent = adminScanned;
        if (adminShreddedEl) adminShreddedEl.textContent = adminShredded;
        
        const miscCountEl = document.getElementById('miscCount');
        const miscScannedEl = document.getElementById('miscScanned');
        const miscShreddedEl = document.getElementById('miscShredded');
        
        if (miscCountEl) miscCountEl.textContent = miscCount;
        if (miscScannedEl) miscScannedEl.textContent = miscScanned;
        if (miscShreddedEl) miscShreddedEl.textContent = miscShredded;
    }

    function saveAsTemplate() {
        const careHomeElement = auditContent.querySelector('.header-section .editable-inline');
        let templateName = 'Audit Trail Template';
        
        if (careHomeElement && careHomeElement.textContent.trim()) {
            templateName = careHomeElement.textContent.trim();
        }

        const auditHTML = auditContent.innerHTML;
        
        let templates = localStorage.getItem('auditTrailTemplates');
        templates = templates ? JSON.parse(templates) : {};
        
        templates[templateName] = {
            html: auditHTML,
            date: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('auditTrailTemplates', JSON.stringify(templates));
        
        alert(`Template "${templateName}" saved successfully!`);
        loadTemplates();
    }

    function loadTemplates() {
        const templatesSection = document.getElementById('templatesSection');
        const templatesList = document.getElementById('templatesList');
        
        let templates = localStorage.getItem('auditTrailTemplates');
        templates = templates ? JSON.parse(templates) : {};
        
        if (Object.keys(templates).length === 0) {
            templatesSection.style.display = 'none';
            return;
        }
        
        templatesSection.style.display = 'block';
        templatesList.innerHTML = '';
        
        for (const [name, data] of Object.entries(templates)) {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-card-icon">📋</div>
                <div class="template-card-name">${name}</div>
                <div class="template-card-date">${data.date}</div>
                <button class="template-card-delete" onclick="deleteTemplate('${name}')">×</button>
            `;
            
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('template-card-delete')) {
                    applyTemplate(name);
                }
            });
            
            templatesList.appendChild(card);
        }
    }

    window.deleteTemplate = function(templateName) {
        if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
            let templates = localStorage.getItem('auditTrailTemplates');
            templates = JSON.parse(templates);
            delete templates[templateName];
            localStorage.setItem('auditTrailTemplates', JSON.stringify(templates));
            loadTemplates();
        }
    };

    function applyTemplate(templateName) {
        let templates = localStorage.getItem('auditTrailTemplates');
        templates = JSON.parse(templates);
        
        if (templates[templateName]) {
            auditContent.innerHTML = templates[templateName].html;
            alert(`Template "${templateName}" loaded successfully!`);
            
            // Re-attach event listeners after loading template
            const checkboxes = document.querySelectorAll('#auditTableBody input[type="checkbox"]');
            const categorySelects = document.querySelectorAll('#auditTableBody .box-category');
            
            checkboxes.forEach(cb => cb.addEventListener('change', updateSummary));
            categorySelects.forEach(select => select.addEventListener('change', updateSummary));
            
            updateSummary();
        }
    }

    function downloadPDF() {
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Audit_Trail_${currentDate}.pdf`;
        
        const element = auditContent;
        
        const opt = {
            margin: [8, 8, 8, 8],
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 1.5,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 1400,
                width: 1400
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        html2pdf().set(opt).from(element).save();
    }

    function saveAuditData() {
        const rows = document.querySelectorAll('#auditTableBody tr');
        const auditData = {
            boxes: [],
            boxCounter: boxCounter
        };
        
        rows.forEach(row => {
            const boxNumber = row.querySelector('.box-number')?.value || '';
            const category = row.querySelector('.box-category')?.value || '';
            const description = row.querySelector('.box-description')?.value || '';
            const dateRange = row.querySelector('.box-daterange')?.value || '';
            const scanned = row.querySelector('.box-scanned')?.checked || false;
            const shredded = row.querySelector('.box-shredded')?.checked || false;
            const notes = row.querySelector('.box-notes')?.value || '';
            
            auditData.boxes.push({
                boxNumber,
                category,
                description,
                dateRange,
                scanned,
                shredded,
                notes
            });
        });
        
        localStorage.setItem('currentAuditData', JSON.stringify(auditData));
    }

    function loadAuditData() {
        const savedData = localStorage.getItem('currentAuditData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Error loading audit data:', e);
                return null;
            }
        }
        return null;
    }

    function restoreAuditData(data) {
        if (!data || !data.boxes) return;
        
        boxCounter = data.boxCounter || 1;
        
        data.boxes.forEach(boxData => {
            const tableBody = document.getElementById('auditTableBody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" value="${boxData.boxNumber}" class="box-number"></td>
                <td>
                    <select class="box-category">
                        <option value="">Select...</option>
                        <option value="HR" ${boxData.category === 'HR' ? 'selected' : ''}>HR</option>
                        <option value="Residents" ${boxData.category === 'Residents' ? 'selected' : ''}>Residents</option>
                        <option value="Admin" ${boxData.category === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option value="Misc" ${boxData.category === 'Misc' ? 'selected' : ''}>Misc</option>
                    </select>
                </td>
                <td><input type="text" value="${boxData.description}" placeholder="Brief description" class="box-description"></td>
                <td><input type="text" value="${boxData.dateRange}" placeholder="e.g., 2020-2022" class="box-daterange"></td>
                <td style="text-align: center;"><input type="checkbox" class="box-scanned" ${boxData.scanned ? 'checked' : ''}></td>
                <td style="text-align: center;"><input type="checkbox" class="box-shredded" ${boxData.shredded ? 'checked' : ''}></td>
                <td><input type="text" value="${boxData.notes}" placeholder="Additional notes" class="box-notes"></td>
                <td class="no-print" style="text-align: center;">
                    <button class="btn btn-delete" onclick="deleteBoxEntry(this)">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to restored rows
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            const categorySelect = row.querySelector('.box-category');
            const textInputs = row.querySelectorAll('input[type="text"]');
            
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    updateSummary();
                    saveAuditData();
                });
            });
            categorySelect.addEventListener('change', () => {
                updateSummary();
                saveAuditData();
            });
            textInputs.forEach(input => {
                input.addEventListener('input', () => {
                    updateSummary();
                    saveAuditData();
                });
                input.addEventListener('change', () => {
                    updateSummary();
                    saveAuditData();
                });
            });
        });
    }

    window.clearAuditData = function() {
        if (confirm('Are you sure you want to clear all audit data and start fresh? This cannot be undone.')) {
            localStorage.removeItem('currentAuditData');
            location.reload();
        }
    };
});

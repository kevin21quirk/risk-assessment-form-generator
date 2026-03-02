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
        
        // Add event listeners to update summary
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        const categorySelect = row.querySelector('.box-category');
        
        checkboxes.forEach(cb => cb.addEventListener('change', updateSummary));
        categorySelect.addEventListener('change', updateSummary);
        
        updateSummary();
    }

    window.deleteBoxEntry = function(button) {
        if (confirm('Are you sure you want to delete this box entry?')) {
            button.closest('tr').remove();
            updateSummary();
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
            const category = row.querySelector('.box-category').value;
            const scanned = row.querySelector('.box-scanned').checked;
            const shredded = row.querySelector('.box-shredded').checked;
            
            if (scanned) totalScanned++;
            if (shredded) totalShredded++;
            if (scanned && shredded) totalBoth++;
            
            // Category breakdown
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
        document.getElementById('totalBoxes').textContent = totalBoxes;
        document.getElementById('totalScanned').textContent = totalScanned;
        document.getElementById('totalShredded').textContent = totalShredded;
        document.getElementById('totalBoth').textContent = totalBoth;
        
        // Update category breakdown
        document.getElementById('hrCount').textContent = hrCount;
        document.getElementById('hrScanned').textContent = hrScanned;
        document.getElementById('hrShredded').textContent = hrShredded;
        
        document.getElementById('residentsCount').textContent = residentsCount;
        document.getElementById('residentsScanned').textContent = residentsScanned;
        document.getElementById('residentsShredded').textContent = residentsShredded;
        
        document.getElementById('adminCount').textContent = adminCount;
        document.getElementById('adminScanned').textContent = adminScanned;
        document.getElementById('adminShredded').textContent = adminShredded;
        
        document.getElementById('miscCount').textContent = miscCount;
        document.getElementById('miscScanned').textContent = miscScanned;
        document.getElementById('miscShredded').textContent = miscShredded;
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
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        html2pdf().set(opt).from(element).save();
    }
});

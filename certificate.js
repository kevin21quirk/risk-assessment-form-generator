if (!sessionStorage.getItem('authenticated')) {
    window.location.href = 'index.html';
}

let editMode = false;

document.addEventListener('DOMContentLoaded', function() {
    const editModeBtn = document.getElementById('editModeBtn');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const switchToRiskBtn = document.getElementById('switchToRiskBtn');
    const switchToCleaningBtn = document.getElementById('switchToCleaningBtn');
    const switchToLanyardBtn = document.getElementById('switchToLanyardBtn');
    const switchToAuditBtn = document.getElementById('switchToAuditBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const certificateContent = document.getElementById('certificateContent');

    editModeBtn.addEventListener('click', toggleEditMode);
    saveTemplateBtn.addEventListener('click', saveAsTemplate);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    switchToRiskBtn.addEventListener('click', switchToRiskAssessment);
    switchToCleaningBtn.addEventListener('click', () => window.location.href = 'cleaning-assessment.html');
    switchToLanyardBtn.addEventListener('click', () => window.location.href = 'lanyard-passes.html');
    switchToAuditBtn.addEventListener('click', () => window.location.href = 'audit-trail.html');
    logoutBtn.addEventListener('click', logout);

    loadTemplates();
    generateCertificateNumber();

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    }

    function switchToRiskAssessment() {
        window.location.href = 'app.html';
    }

    function generateCertificateNumber() {
        const currentYear = new Date().getFullYear();
        let certCounter = localStorage.getItem('certCounter_' + currentYear);
        
        if (!certCounter) {
            certCounter = 1;
        } else {
            certCounter = parseInt(certCounter);
        }
        
        const sequentialNumber = String(certCounter).padStart(3, '0');
        const certRefNo = `ACCH-KQ-${currentYear}-${sequentialNumber}`;
        
        document.getElementById('certRefNo').textContent = certRefNo;
    }

    function incrementCertificateCounter() {
        const currentYear = new Date().getFullYear();
        let certCounter = localStorage.getItem('certCounter_' + currentYear);
        
        if (!certCounter) {
            certCounter = 1;
        } else {
            certCounter = parseInt(certCounter) + 1;
        }
        
        localStorage.setItem('certCounter_' + currentYear, certCounter);
    }

    function toggleEditMode() {
        editMode = !editMode;
        
        if (editMode) {
            certificateContent.classList.add('edit-mode');
            editModeBtn.textContent = 'Disable Edit Mode';
            editModeBtn.classList.remove('btn-primary');
            editModeBtn.classList.add('btn-secondary');
            
            const editableElements = certificateContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'true');
            });
        } else {
            certificateContent.classList.remove('edit-mode');
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.classList.remove('btn-secondary');
            editModeBtn.classList.add('btn-primary');
            
            const editableElements = certificateContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'false');
            });
        }
    }

    function saveAsTemplate() {
        const issuedToElement = certificateContent.querySelector('.issued-to .editable-content');
        let templateName = 'Certificate Template';
        
        if (issuedToElement) {
            const firstLine = issuedToElement.querySelector('p');
            if (firstLine && firstLine.textContent.trim()) {
                templateName = firstLine.textContent.trim();
            }
        }

        const certificateHTML = certificateContent.innerHTML;
        
        let templates = localStorage.getItem('certificateTemplates');
        templates = templates ? JSON.parse(templates) : {};
        
        templates[templateName] = {
            html: certificateHTML,
            date: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('certificateTemplates', JSON.stringify(templates));
        
        alert(`Template "${templateName}" saved successfully!`);
        loadTemplates();
    }

    function loadTemplates() {
        const templatesSection = document.getElementById('templatesSection');
        const templatesList = document.getElementById('templatesList');
        
        let templates = localStorage.getItem('certificateTemplates');
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
                <div class="template-card-icon">📄</div>
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
            let templates = localStorage.getItem('certificateTemplates');
            templates = JSON.parse(templates);
            delete templates[templateName];
            localStorage.setItem('certificateTemplates', JSON.stringify(templates));
            loadTemplates();
        }
    };

    function applyTemplate(templateName) {
        let templates = localStorage.getItem('certificateTemplates');
        templates = JSON.parse(templates);
        
        if (templates[templateName]) {
            certificateContent.innerHTML = templates[templateName].html;
            generateCertificateNumber();
            alert(`Template "${templateName}" loaded successfully!`);
        }
    }

    function downloadPDF() {
        const currentDate = new Date().toISOString().split('T')[0];
        const certRefNo = document.getElementById('certRefNo').textContent;
        const filename = `Certificate_of_Destruction_${certRefNo}_${currentDate}.pdf`;
        
        const element = certificateContent;
        
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
        
        html2pdf().set(opt).from(element).save().then(() => {
            incrementCertificateCounter();
            setTimeout(() => {
                generateCertificateNumber();
            }, 500);
        });
    }
});

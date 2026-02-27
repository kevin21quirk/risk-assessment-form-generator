if (!sessionStorage.getItem('authenticated')) {
    window.location.href = 'index.html';
}

let editMode = false;

document.addEventListener('DOMContentLoaded', function() {
    const editModeBtn = document.getElementById('editModeBtn');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const switchToRiskBtn = document.getElementById('switchToRiskBtn');
    const switchToCertBtn = document.getElementById('switchToCertBtn');
    const switchToLanyardBtn = document.getElementById('switchToLanyardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const assessmentContent = document.getElementById('assessmentContent');

    editModeBtn.addEventListener('click', toggleEditMode);
    saveTemplateBtn.addEventListener('click', saveAsTemplate);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    switchToRiskBtn.addEventListener('click', () => window.location.href = 'app.html');
    switchToCertBtn.addEventListener('click', () => window.location.href = 'certificate.html');
    switchToLanyardBtn.addEventListener('click', () => window.location.href = 'lanyard-passes.html');
    logoutBtn.addEventListener('click', logout);

    loadTemplates();

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
            assessmentContent.classList.add('edit-mode');
            editModeBtn.textContent = 'Disable Edit Mode';
            editModeBtn.classList.remove('btn-primary');
            editModeBtn.classList.add('btn-secondary');
            
            const editableElements = assessmentContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'true');
            });
        } else {
            assessmentContent.classList.remove('edit-mode');
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.classList.remove('btn-secondary');
            editModeBtn.classList.add('btn-primary');
            
            const editableElements = assessmentContent.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
            editableElements.forEach(element => {
                element.setAttribute('contenteditable', 'false');
            });
        }
    }

    function saveAsTemplate() {
        const careHomeElement = assessmentContent.querySelector('.care-home-section .editable-inline');
        let templateName = 'Cleaning Assessment Template';
        
        if (careHomeElement && careHomeElement.textContent.trim()) {
            templateName = careHomeElement.textContent.trim();
        }

        const assessmentHTML = assessmentContent.innerHTML;
        
        let templates = localStorage.getItem('cleaningAssessmentTemplates');
        templates = templates ? JSON.parse(templates) : {};
        
        templates[templateName] = {
            html: assessmentHTML,
            date: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('cleaningAssessmentTemplates', JSON.stringify(templates));
        
        alert(`Template "${templateName}" saved successfully!`);
        loadTemplates();
    }

    function loadTemplates() {
        const templatesSection = document.getElementById('templatesSection');
        const templatesList = document.getElementById('templatesList');
        
        let templates = localStorage.getItem('cleaningAssessmentTemplates');
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
                <div class="template-card-icon">🧹</div>
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
            let templates = localStorage.getItem('cleaningAssessmentTemplates');
            templates = JSON.parse(templates);
            delete templates[templateName];
            localStorage.setItem('cleaningAssessmentTemplates', JSON.stringify(templates));
            loadTemplates();
        }
    };

    function applyTemplate(templateName) {
        let templates = localStorage.getItem('cleaningAssessmentTemplates');
        templates = JSON.parse(templates);
        
        if (templates[templateName]) {
            assessmentContent.innerHTML = templates[templateName].html;
            alert(`Template "${templateName}" loaded successfully!`);
        }
    }

    function downloadPDF() {
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Cleaning_Contractor_Safeguarding_Assessment_${currentDate}.pdf`;
        
        const element = assessmentContent;
        
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

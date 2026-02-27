if (!sessionStorage.getItem('authenticated')) {
    window.location.href = 'index.html';
}

let editMode = false;
let sectionCounter = 10;

document.addEventListener('DOMContentLoaded', function() {
    const editModeBtn = document.getElementById('editModeBtn');
    const addSectionBtn = document.getElementById('addSectionBtn');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const switchToCertBtn = document.getElementById('switchToCertBtn');
    const switchToCleaningBtn = document.getElementById('switchToCleaningBtn');
    const switchToLanyardBtn = document.getElementById('switchToLanyardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const formContent = document.getElementById('formContent');

    editModeBtn.addEventListener('click', toggleEditMode);
    addSectionBtn.addEventListener('click', addCustomSection);
    saveTemplateBtn.addEventListener('click', saveAsTemplate);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    switchToCertBtn.addEventListener('click', switchToCertificate);
    switchToCleaningBtn.addEventListener('click', switchToCleaningAssessment);
    switchToLanyardBtn.addEventListener('click', () => window.location.href = 'lanyard-passes.html');
    logoutBtn.addEventListener('click', logout);

    loadTemplates();

    function switchToCertificate() {
        window.location.href = 'certificate.html';
    }

    function switchToCleaningAssessment() {
        window.location.href = 'cleaning-assessment.html';
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
            formContent.classList.add('edit-mode');
            editModeBtn.textContent = 'Disable Edit Mode';
            editModeBtn.classList.remove('btn-primary');
            editModeBtn.classList.add('btn-secondary');
            addSectionBtn.style.display = 'inline-block';
            
            enableEditing();
            addDeleteButtons();
        } else {
            formContent.classList.remove('edit-mode');
            editModeBtn.textContent = 'Enable Edit Mode';
            editModeBtn.classList.remove('btn-secondary');
            editModeBtn.classList.add('btn-primary');
            addSectionBtn.style.display = 'none';
            
            disableEditing();
            removeDeleteButtons();
        }
    }

    function enableEditing() {
        const editableElements = document.querySelectorAll('.editable-title, .editable-subtitle, .editable-heading, .editable-content, .editable-inline');
        editableElements.forEach(element => {
            element.setAttribute('contenteditable', 'true');
        });

        const tableCells = document.querySelectorAll('.risk-table td');
        tableCells.forEach(cell => {
            cell.setAttribute('contenteditable', 'true');
            cell.style.cursor = 'text';
        });
    }

    function disableEditing() {
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(element => {
            element.setAttribute('contenteditable', 'false');
        });

        const tableCells = document.querySelectorAll('.risk-table td');
        tableCells.forEach(cell => {
            cell.style.cursor = 'default';
        });
    }

    function addDeleteButtons() {
        const sections = document.querySelectorAll('.section[data-section]');
        sections.forEach(section => {
            if (!section.querySelector('.section-controls')) {
                const controls = document.createElement('div');
                controls.className = 'section-controls';
                controls.innerHTML = '<button class="btn btn-danger delete-section">Delete Section</button>';
                section.appendChild(controls);
                
                controls.querySelector('.delete-section').addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this section?')) {
                        section.remove();
                    }
                });
            }
        });
    }

    function removeDeleteButtons() {
        const controls = document.querySelectorAll('.section-controls');
        controls.forEach(control => control.remove());
    }

    function addCustomSection() {
        sectionCounter++;
        
        const newSection = document.createElement('div');
        newSection.className = 'section custom-section';
        newSection.setAttribute('data-section', `custom-${sectionCounter}`);
        newSection.innerHTML = `
            <h3 contenteditable="true" class="editable-heading">${sectionCounter}. New Section Title</h3>
            <div contenteditable="true" class="editable-content">
                <p>Add your content here. You can format this section as needed.</p>
                <ul>
                    <li>Add bullet points</li>
                    <li>Or other content</li>
                </ul>
            </div>
            <div class="section-controls">
                <button class="btn btn-danger delete-section">Delete Section</button>
            </div>
        `;
        
        formContent.appendChild(newSection);
        
        newSection.querySelector('.delete-section').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this section?')) {
                newSection.remove();
            }
        });
        
        newSection.querySelector('.editable-heading').focus();
    }

    async function downloadPDF() {
        const wasInEditMode = editMode;
        
        if (wasInEditMode) {
            toggleEditMode();
        }

        downloadPdfBtn.textContent = 'Generating PDF...';
        downloadPdfBtn.disabled = true;

        try {
            const element = document.getElementById('formContent');
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Risk_Assessment_Form_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                },
                pagebreak: { 
                    mode: ['css', 'legacy']
                }
            };

            await html2pdf().set(opt).from(element).save();

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
        } finally {
            downloadPdfBtn.textContent = 'Download PDF';
            downloadPdfBtn.disabled = false;
            
            if (wasInEditMode) {
                toggleEditMode();
            }
        }
    }

    function saveAsTemplate() {
        const locationContent = document.querySelector('.location-content');
        if (!locationContent) {
            alert('Cannot find location information.');
            return;
        }

        const locationText = locationContent.textContent.trim();
        const careHomeName = locationText.split('\n')[0].trim();

        if (!careHomeName) {
            alert('Please enter a care home name in the Location field.');
            return;
        }

        const formHTML = document.getElementById('formContent').innerHTML;
        
        const templates = getTemplates();
        const templateId = Date.now().toString();
        
        templates[templateId] = {
            id: templateId,
            name: careHomeName,
            content: formHTML,
            date: new Date().toISOString()
        };

        localStorage.setItem('riskAssessmentTemplates', JSON.stringify(templates));
        
        alert(`Template "${careHomeName}" saved successfully!`);
        loadTemplates();
    }

    function getTemplates() {
        const templatesData = localStorage.getItem('riskAssessmentTemplates');
        return templatesData ? JSON.parse(templatesData) : {};
    }

    function loadTemplates() {
        const templates = getTemplates();
        const templatesSection = document.getElementById('templatesSection');
        const templatesList = document.getElementById('templatesList');

        if (Object.keys(templates).length === 0) {
            templatesSection.style.display = 'none';
            return;
        }

        templatesSection.style.display = 'block';
        templatesList.innerHTML = '';

        Object.values(templates).forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <button class="template-delete" data-id="${template.id}">×</button>
                <div class="template-card-icon">📁</div>
                <div class="template-card-name">${template.name}</div>
                <div class="template-card-date">Saved: ${new Date(template.date).toLocaleDateString()}</div>
            `;

            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('template-delete')) {
                    loadTemplate(template.id);
                }
            });

            const deleteBtn = card.querySelector('.template-delete');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTemplate(template.id);
            });

            templatesList.appendChild(card);
        });
    }

    function loadTemplate(templateId) {
        const templates = getTemplates();
        const template = templates[templateId];

        if (!template) {
            alert('Template not found.');
            return;
        }

        if (confirm(`Load template "${template.name}"? This will replace the current form content.`)) {
            const wasInEditMode = editMode;
            if (wasInEditMode) {
                toggleEditMode();
            }

            document.getElementById('formContent').innerHTML = template.content;

            if (wasInEditMode) {
                toggleEditMode();
            }

            alert(`Template "${template.name}" loaded successfully!`);
        }
    }

    function deleteTemplate(templateId) {
        const templates = getTemplates();
        const template = templates[templateId];

        if (confirm(`Delete template "${template.name}"?`)) {
            delete templates[templateId];
            localStorage.setItem('riskAssessmentTemplates', JSON.stringify(templates));
            loadTemplates();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            alert('Changes are automatically saved in your browser!');
        }
    });

    window.addEventListener('beforeunload', function(e) {
        if (editMode) {
            e.preventDefault();
            e.returnValue = '';
            return 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
});

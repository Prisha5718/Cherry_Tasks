class ResumeBuilder {
    constructor() {
        this.resumeData = {
            personalInfo: {
                name: "",
                email: "",
                phone: "",
                linkedin: "",
                github: "",
                address: ""
            },
            education: [],
            experience: [],
            projects: [],
            skills: []
        };

        this.currentSection = 'personal';
        this.entryCounters = {
            education: 0,
            experience: 0,
            projects: 0
        };

        this.init();
    }

    init() {
        // Ensure loading overlay is hidden on startup
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }

        // Load existing data from storage or keep empty forms
        this.loadFromStorage();
        this.bindEvents();
        this.renderDynamicSections();
        this.updatePreview();
    }

    // Bind all event listeners
    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Personal info form inputs with real-time updates
        const personalFields = ['name', 'email', 'phone', 'linkedin', 'github', 'address'];
        personalFields.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', this.debounce((e) => {
                    this.resumeData.personalInfo[field] = e.target.value;
                    this.updatePreview();
                    this.saveToStorage();
                }, 250));
            }
        });

        // Add section buttons
        const addEducationBtn = document.getElementById('add-education');
        const addExperienceBtn = document.getElementById('add-experience');
        const addProjectBtn = document.getElementById('add-project');
        const addSkillBtn = document.getElementById('add-skill');
        const downloadBtn = document.getElementById('download-pdf');

        if (addEducationBtn) addEducationBtn.addEventListener('click', () => this.addEducation());
        if (addExperienceBtn) addExperienceBtn.addEventListener('click', () => this.addExperience());
        if (addProjectBtn) addProjectBtn.addEventListener('click', () => this.addProject());
        if (addSkillBtn) addSkillBtn.addEventListener('click', () => this.addSkill());
        
        // CRITICAL FIX: PDF download ONLY on explicit user action
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadPDF();
            });
        }

        // Skills input enter key
        const skillInput = document.getElementById('skill-input');
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill();
                }
            });
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Switch between form sections
    switchSection(sectionId) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update active form section
        document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(`${sectionId}-section`);
        if (activeSection) activeSection.classList.add('active');

        this.currentSection = sectionId;
    }

    // Load data from storage if available
    loadFromStorage() {
        try {
            // Note: Following strict instructions - not using localStorage in sandbox
            // In a real environment, this would load from localStorage
            console.log('Storage loading skipped for sandbox environment');
            
            // Populate form fields with current (empty) data
            this.populateFormFields();
        } catch (error) {
            console.warn('Storage loading failed:', error);
        }
    }

    // Save data to storage
    saveToStorage() {
        try {
            // Note: Following strict instructions - not using localStorage in sandbox
            console.log('Would save to storage:', this.resumeData);
        } catch (error) {
            console.warn('Storage saving failed:', error);
        }
    }

    // Populate form fields with current data
    populateFormFields() {
        Object.keys(this.resumeData.personalInfo).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = this.resumeData.personalInfo[key];
            }
        });
    }

    // Education section methods
    addEducation() {
        const id = ++this.entryCounters.education;
        const newEducation = {
            id,
            degree: "",
            institution: "",
            startYear: "",
            endYear: "",
            cgpa: ""
        };

        this.resumeData.education.push(newEducation);
        this.renderEducationEntry(newEducation);
        this.updatePreview();
        this.saveToStorage();
    }

    renderEducationEntry(education) {
        const container = document.getElementById('education-list');
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-card';
        entryDiv.dataset.id = education.id;

        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-number">Education ${education.id}</h4>
                <button class="remove-btn" onclick="resumeBuilder.removeEducation(${education.id})">Remove</button>
            </div>
            <div class="form-group">
                <label class="form-label">Degree/Qualification</label>
                <input type="text" class="form-control" value="${education.degree}" placeholder="Bachelor of Science in Computer Science"
                       onchange="resumeBuilder.updateEducation(${education.id}, 'degree', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Institution/University</label>
                <input type="text" class="form-control" value="${education.institution}" placeholder="University of Washington"
                       onchange="resumeBuilder.updateEducation(${education.id}, 'institution', this.value)">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Start Year</label>
                    <input type="text" class="form-control" value="${education.startYear}" placeholder="2019"
                           onchange="resumeBuilder.updateEducation(${education.id}, 'startYear', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">End Year</label>
                    <input type="text" class="form-control" value="${education.endYear}" placeholder="2023"
                           onchange="resumeBuilder.updateEducation(${education.id}, 'endYear', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">GPA/CGPA (Optional)</label>
                <input type="text" class="form-control" value="${education.cgpa}" placeholder="3.85/4.0"
                       onchange="resumeBuilder.updateEducation(${education.id}, 'cgpa', this.value)">
            </div>
        `;

        container.appendChild(entryDiv);
    }

    updateEducation(id, field, value) {
        const education = this.resumeData.education.find(e => e.id === id);
        if (education) {
            education[field] = value;
            this.updatePreview();
            this.saveToStorage();
        }
    }

    removeEducation(id) {
        this.resumeData.education = this.resumeData.education.filter(e => e.id !== id);
        const element = document.querySelector(`#education-list [data-id="${id}"]`);
        if (element) element.remove();
        this.updatePreview();
        this.saveToStorage();
    }

    // Experience section methods
    addExperience() {
        const id = ++this.entryCounters.experience;
        const newExperience = {
            id,
            jobTitle: "",
            company: "",
            startDate: "",
            endDate: "",
            description: ""
        };

        this.resumeData.experience.push(newExperience);
        this.renderExperienceEntry(newExperience);
        this.updatePreview();
        this.saveToStorage();
    }

    renderExperienceEntry(experience) {
        const container = document.getElementById('experience-list');
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-card';
        entryDiv.dataset.id = experience.id;

        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-number">Experience ${experience.id}</h4>
                <button class="remove-btn" onclick="resumeBuilder.removeExperience(${experience.id})">Remove</button>
            </div>
            <div class="form-group">
                <label class="form-label">Job Title</label>
                <input type="text" class="form-control" value="${experience.jobTitle}" placeholder="Frontend Developer"
                       onchange="resumeBuilder.updateExperience(${experience.id}, 'jobTitle', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="form-control" value="${experience.company}" placeholder="Microsoft"
                       onchange="resumeBuilder.updateExperience(${experience.id}, 'company', this.value)">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="text" class="form-control" value="${experience.startDate}" placeholder="July 2023"
                           onchange="resumeBuilder.updateExperience(${experience.id}, 'startDate', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="text" class="form-control" value="${experience.endDate}" placeholder="Present"
                           onchange="resumeBuilder.updateExperience(${experience.id}, 'endDate', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Job Description</label>
                <textarea class="form-control" rows="4" 
                          placeholder="• Develop responsive web applications using React and TypeScript&#10;• Collaborate with UX designers to implement pixel-perfect interfaces&#10;• Optimize application performance and ensure cross-browser compatibility"
                          onchange="resumeBuilder.updateExperience(${experience.id}, 'description', this.value)">${experience.description}</textarea>
            </div>
        `;

        container.appendChild(entryDiv);
    }

    updateExperience(id, field, value) {
        const experience = this.resumeData.experience.find(e => e.id === id);
        if (experience) {
            experience[field] = value;
            this.updatePreview();
            this.saveToStorage();
        }
    }

    removeExperience(id) {
        this.resumeData.experience = this.resumeData.experience.filter(e => e.id !== id);
        const element = document.querySelector(`#experience-list [data-id="${id}"]`);
        if (element) element.remove();
        this.updatePreview();
        this.saveToStorage();
    }

    // Projects section methods
    addProject() {
        const id = ++this.entryCounters.projects;
        const newProject = {
            id,
            title: "",
            description: "",
            technologies: "",
            year: ""
        };

        this.resumeData.projects.push(newProject);
        this.renderProjectEntry(newProject);
        this.updatePreview();
        this.saveToStorage();
    }

    renderProjectEntry(project) {
        const container = document.getElementById('projects-list');
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-card';
        entryDiv.dataset.id = project.id;

        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-number">Project ${project.id}</h4>
                <button class="remove-btn" onclick="resumeBuilder.removeProject(${project.id})">Remove</button>
            </div>
            <div class="form-group">
                <label class="form-label">Project Title</label>
                <input type="text" class="form-control" value="${project.title}" placeholder="E-Learning Platform"
                       onchange="resumeBuilder.updateProject(${project.id}, 'title', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Project Description</label>
                <textarea class="form-control" rows="3" 
                          placeholder="Built a comprehensive online learning platform with video streaming, interactive quizzes, and progress tracking"
                          onchange="resumeBuilder.updateProject(${project.id}, 'description', this.value)">${project.description}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Technologies Used</label>
                <input type="text" class="form-control" value="${project.technologies}" placeholder="React, Node.js, MongoDB, AWS, WebRTC"
                       onchange="resumeBuilder.updateProject(${project.id}, 'technologies', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Year/Duration</label>
                <input type="text" class="form-control" value="${project.year}" placeholder="2023"
                       onchange="resumeBuilder.updateProject(${project.id}, 'year', this.value)">
            </div>
        `;

        container.appendChild(entryDiv);
    }

    updateProject(id, field, value) {
        const project = this.resumeData.projects.find(p => p.id === id);
        if (project) {
            project[field] = value;
            this.updatePreview();
            this.saveToStorage();
        }
    }

    removeProject(id) {
        this.resumeData.projects = this.resumeData.projects.filter(p => p.id !== id);
        const element = document.querySelector(`#projects-list [data-id="${id}"]`);
        if (element) element.remove();
        this.updatePreview();
        this.saveToStorage();
    }

    // Skills section methods
    addSkill() {
        const input = document.getElementById('skill-input');
        if (!input) return;

        const skill = input.value.trim();
        
        if (skill && !this.resumeData.skills.includes(skill)) {
            this.resumeData.skills.push(skill);
            this.renderAllSkills();
            input.value = '';
            this.updatePreview();
            this.saveToStorage();
        }
    }

    renderSkill(skill, container) {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            <span>${skill}</span>
            <button class="skill-remove" onclick="resumeBuilder.removeSkill('${skill.replace(/'/g, "\\'")}')">×</button>
        `;
        container.appendChild(skillTag);
    }

    removeSkill(skill) {
        this.resumeData.skills = this.resumeData.skills.filter(s => s !== skill);
        this.renderAllSkills();
        this.updatePreview();
        this.saveToStorage();
    }

    renderAllSkills() {
        const container = document.getElementById('skills-list');
        if (!container) return;

        container.innerHTML = '';
        this.resumeData.skills.forEach(skill => this.renderSkill(skill, container));
    }

    // Render all dynamic sections on load
    renderDynamicSections() {
        // Update counters based on existing data
        this.entryCounters.education = this.resumeData.education.length > 0 ? Math.max(...this.resumeData.education.map(e => e.id)) : 0;
        this.entryCounters.experience = this.resumeData.experience.length > 0 ? Math.max(...this.resumeData.experience.map(e => e.id)) : 0;
        this.entryCounters.projects = this.resumeData.projects.length > 0 ? Math.max(...this.resumeData.projects.map(p => p.id)) : 0;

        // Clear and render all sections
        const educationList = document.getElementById('education-list');
        const experienceList = document.getElementById('experience-list');
        const projectsList = document.getElementById('projects-list');

        if (educationList) educationList.innerHTML = '';
        if (experienceList) experienceList.innerHTML = '';
        if (projectsList) projectsList.innerHTML = '';

        // Render existing entries
        this.resumeData.education.forEach(education => this.renderEducationEntry(education));
        this.resumeData.experience.forEach(experience => this.renderExperienceEntry(experience));
        this.resumeData.projects.forEach(project => this.renderProjectEntry(project));
        this.renderAllSkills();
    }

    // Update resume preview with professional styling
    updatePreview() {
        this.updatePersonalInfoPreview();
        this.updateEducationPreview();
        this.updateExperiencePreview();
        this.updateProjectsPreview();
        this.updateSkillsPreview();
    }

    updatePersonalInfoPreview() {
        const { name, email, phone, linkedin, github, address } = this.resumeData.personalInfo;
        
        const nameEl = document.getElementById('preview-name');
        const emailEl = document.getElementById('preview-email');
        const phoneEl = document.getElementById('preview-phone');
        const addressEl = document.getElementById('preview-address');
        const linkedinEl = document.getElementById('preview-linkedin');
        const githubEl = document.getElementById('preview-github');

        if (nameEl) nameEl.textContent = name || 'Your Name';
        if (emailEl) emailEl.textContent = email;
        if (phoneEl) phoneEl.textContent = phone;
        if (addressEl) addressEl.textContent = address;

        if (linkedinEl) {
            if (linkedin) {
                linkedinEl.href = linkedin;
                linkedinEl.textContent = 'LinkedIn Profile';
                linkedinEl.classList.remove('hidden');
            } else {
                linkedinEl.classList.add('hidden');
            }
        }

        if (githubEl) {
            if (github) {
                githubEl.href = github;
                githubEl.textContent = 'GitHub Profile';
                githubEl.classList.remove('hidden');
            } else {
                githubEl.classList.add('hidden');
            }
        }
    }

    updateEducationPreview() {
        const container = document.getElementById('preview-education');
        const section = document.getElementById('preview-education-section');
        
        if (!container || !section) return;

        if (this.resumeData.education.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = this.resumeData.education.map(edu => {
            const duration = `${edu.startYear}${edu.endYear ? ' - ' + edu.endYear : ''}`;
            return `
                <div class="resume-entry">
                    <div class="entry-title">${edu.degree || 'Degree Title'}</div>
                    <div class="entry-subtitle">${edu.institution || 'Institution Name'}</div>
                    <div class="entry-duration">${duration}${edu.cgpa ? ' • GPA: ' + edu.cgpa : ''}</div>
                </div>
            `;
        }).join('');
    }

    updateExperiencePreview() {
        const container = document.getElementById('preview-experience');
        const section = document.getElementById('preview-experience-section');
        
        if (!container || !section) return;

        if (this.resumeData.experience.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = this.resumeData.experience.map(exp => {
            const duration = `${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ''}`;
            return `
                <div class="resume-entry">
                    <div class="entry-title">${exp.jobTitle || 'Job Title'}</div>
                    <div class="entry-subtitle">${exp.company || 'Company Name'}</div>
                    <div class="entry-duration">${duration}</div>
                    ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    updateProjectsPreview() {
        const container = document.getElementById('preview-projects');
        const section = document.getElementById('preview-projects-section');
        
        if (!container || !section) return;

        if (this.resumeData.projects.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = this.resumeData.projects.map(project => {
            return `
                <div class="resume-entry">
                    <div class="entry-title">${project.title || 'Project Title'}</div>
                    <div class="entry-duration">${project.year || 'Year'}</div>
                    ${project.description ? `<div class="entry-description">${project.description}</div>` : ''}
                    ${project.technologies ? `<div class="entry-subtitle"><strong>Technologies:</strong> ${project.technologies}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    updateSkillsPreview() {
        const container = document.getElementById('preview-skills');
        const section = document.getElementById('preview-skills-section');
        
        if (!container || !section) return;

        if (this.resumeData.skills.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = `
            <div class="skills-grid">
                ${this.resumeData.skills.map(skill => `<span class="resume-skill-item">${skill}</span>`).join('')}
            </div>
        `;
    }

    // PDF Download with proper error handling - ONLY triggered by user action
    async downloadPDF() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const downloadBtn = document.getElementById('download-pdf');
        
        if (!loadingOverlay) return;

        // Show loading state
        loadingOverlay.classList.remove('hidden');
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Generating...';
        }

        try {
            // Validate required libraries
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }
            if (typeof jspdf === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }

            const element = document.getElementById('resume-preview');
            if (!element) {
                throw new Error('Resume preview element not found');
            }

            // Generate high-quality canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.offsetWidth,
                height: element.offsetHeight,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('resume-preview');
                    if (clonedElement) {
                        clonedElement.style.maxHeight = 'none';
                        clonedElement.style.overflow = 'visible';
                    }
                }
            });

            // Create PDF with proper sizing
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const name = this.resumeData.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume';
            const date = new Date().toISOString().split('T')[0];
            const fileName = `${name}_Resume_${date}.pdf`;

            // Download the PDF
            pdf.save(fileName);

            // Success feedback
            setTimeout(() => {
                if (downloadBtn) {
                    downloadBtn.textContent = '✅ Downloaded!';
                    setTimeout(() => {
                        downloadBtn.textContent = '📄 Download PDF';
                        downloadBtn.disabled = false;
                    }, 2000);
                }
            }, 500);

        } catch (error) {
            console.error('PDF generation error:', error);
            
            // User-friendly error message
            const errorMsg = error.message.includes('library') 
                ? 'PDF libraries are not loaded. Please refresh the page and try again.'
                : 'Failed to generate PDF. Please check your resume content and try again.';
            
            alert(`Error: ${errorMsg}`);
            
            // Reset button
            if (downloadBtn) {
                downloadBtn.textContent = '❌ Try Again';
                downloadBtn.disabled = false;
                setTimeout(() => {
                    downloadBtn.textContent = '📄 Download PDF';
                }, 3000);
            }
        } finally {
            // Always hide loading overlay
            setTimeout(() => {
                if (loadingOverlay) {
                    loadingOverlay.classList.add('hidden');
                }
            }, 500);
        }
    }
}

// Initialize application when DOM is ready
let resumeBuilder;

document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilder();
});
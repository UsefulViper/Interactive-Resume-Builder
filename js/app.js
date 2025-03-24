// Main Application JavaScript for Interactive Resume Builder

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application once the DOM is fully loaded
    initApp();
});

// Application State
const appState = {
    currentTemplate: 'modern',
    currentSection: 'personal',
    personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        photo: null,
        links: []
    },
    summary: '',
    experience: [],
    education: [],
    skills: {
        type: 'tags', // 'tags', 'rated', 'categorized'
        items: []
    },
    languages: [],
    courses: [],
    projects: [],
    customSections: {},
    atsScore: 0,
    darkMode: false
};

// Template Options
const templates = {
    modern: {
        name: 'Modern',
        description: 'Clean and professional design with sidebar'
    },
    minimalist: {
        name: 'Minimalist',
        description: 'Simple and elegant with minimal styling'
    },
    classic: {
        name: 'Classic',
        description: 'Traditional resume format with two columns'
    },
    creative: {
        name: 'Creative',
        description: 'Bold design with unique layout and colors'
    }
};

// Initialize App
function initApp() {
    // Setup UI event listeners
    setupEventListeners();
    
    // Initialize theme
    initTheme();
    
    // Set default active section
    activateSection('personal');
    
    // Initialize template selection
    initTemplates();
    
    // Initialize ATS score
    updateATSScore();
    
    // Initialize preview
    updatePreview();
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme switcher
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
    
    // Section navigation
    const sectionItems = document.querySelectorAll('.section-item');
    sectionItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            activateSection(section);
        });
    });
    
    // Template selection
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const template = card.getAttribute('data-template');
            selectTemplate(template);
        });
    });
    
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveResume);
    }
    
    // Download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResume);
    }
    
    // Form event listeners
    setupFormEventListeners();
    
    // Modal event listeners
    setupModalEventListeners();
}

// Setup Form Event Listeners
function setupFormEventListeners() {
    // Personal Information Form
    setupPersonalInfoForm();
    
    // Professional Summary Form
    setupSummaryForm();
    
    // Experience Form
    setupExperienceForm();
    
    // Education Form
    setupEducationForm();
    
    // Skills Form
    setupSkillsForm();
    
    // Languages Form
    setupLanguagesForm();
    
    // Courses Form
    setupCoursesForm();
    
    // Projects Form
    setupProjectsForm();
}

// Personal Information Form
function setupPersonalInfoForm() {
    const personalForm = document.getElementById('personal-form');
    if (!personalForm) return;
    
    // Input fields
    const nameInput = document.getElementById('full-name');
    const titleInput = document.getElementById('job-title');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    
    // Photo upload
    const photoInput = document.getElementById('photo-upload');
    const photoPreview = document.querySelector('.photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo');
    
    // Social links
    const addLinkBtn = document.getElementById('add-link');
    const linksContainer = document.getElementById('links-container');
    
    // Handle input changes
    [nameInput, titleInput, emailInput, phoneInput, locationInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                appState.personalInfo[input.id.replace('-', '')] = input.value;
                updatePreview();
                updateATSScore();
            });
        }
    });
    
    // Handle photo upload
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    appState.personalInfo.photo = event.target.result;
                    if (photoPreview) {
                        photoPreview.innerHTML = `<img src="${event.target.result}" alt="Profile Photo">`;
                    }
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle photo removal
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', () => {
            appState.personalInfo.photo = null;
            if (photoInput) photoInput.value = '';
            if (photoPreview) {
                photoPreview.innerHTML = '<i class="fas fa-user"></i>';
            }
            updatePreview();
        });
    }
    
    // Handle adding social links
    if (addLinkBtn && linksContainer) {
        addLinkBtn.addEventListener('click', () => {
            addSocialLinkField();
        });
    }
}

// Add Social Link Field
function addSocialLinkField(linkData = null) {
    const linksContainer = document.getElementById('links-container');
    if (!linksContainer) return;
    
    const linkId = `link-${Date.now()}`;
    const linkElement = document.createElement('div');
    linkElement.className = 'link-input-group';
    linkElement.setAttribute('data-link-id', linkId);
    
    const socialTypes = [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'github', label: 'GitHub' },
        { value: 'portfolio', label: 'Portfolio' },
        { value: 'twitter', label: 'Twitter' },
        { value: 'other', label: 'Other' }
    ];
    
    let typeOptions = '';
    socialTypes.forEach(type => {
        const selected = linkData && linkData.type === type.value ? 'selected' : '';
        typeOptions += `<option value="${type.value}" ${selected}>${type.label}</option>`;
    });
    
    linkElement.innerHTML = `
        <select class="link-type">
            ${typeOptions}
        </select>
        <input type="url" class="link-url" placeholder="https://..." value="${linkData ? linkData.url : ''}">
        <button type="button" class="remove-link-btn"><i class="fas fa-times"></i></button>
    `;
    
    linksContainer.appendChild(linkElement);
    
    // Add event listeners for the new link
    const typeSelect = linkElement.querySelector('.link-type');
    const urlInput = linkElement.querySelector('.link-url');
    const removeBtn = linkElement.querySelector('.remove-link-btn');
    
    // Update state when inputs change
    [typeSelect, urlInput].forEach(input => {
        input.addEventListener('input', () => {
            updateSocialLinks();
        });
    });
    
    // Remove link when remove button clicked
    removeBtn.addEventListener('click', () => {
        linkElement.remove();
        updateSocialLinks();
    });
}

// Update Social Links in App State
function updateSocialLinks() {
    const linkElements = document.querySelectorAll('.link-input-group');
    const links = [];
    
    linkElements.forEach(element => {
        const typeSelect = element.querySelector('.link-type');
        const urlInput = element.querySelector('.link-url');
        
        if (typeSelect && urlInput && urlInput.value.trim()) {
            links.push({
                type: typeSelect.value,
                url: urlInput.value.trim()
            });
        }
    });
    
    appState.personalInfo.links = links;
    updatePreview();
}

// Professional Summary Form
function setupSummaryForm() {
    const summaryInput = document.getElementById('professional-summary');
    
    if (summaryInput) {
        summaryInput.addEventListener('input', () => {
            appState.summary = summaryInput.value;
            updatePreview();
            updateATSScore();
        });
    }
}

// Experience Form
function setupExperienceForm() {
    const addExperienceBtn = document.getElementById('add-experience');
    const experienceContainer = document.getElementById('experience-container');
    
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', () => {
            addExperienceField();
        });
    }
}

// Add Experience Field
function addExperienceField(experienceData = null) {
    const experienceContainer = document.getElementById('experience-container');
    if (!experienceContainer) return;
    
    const experienceId = `exp-${Date.now()}`;
    const experienceElement = document.createElement('div');
    experienceElement.className = 'experience-item';
    experienceElement.setAttribute('data-experience-id', experienceId);
    
    experienceElement.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="position-${experienceId}">Job Title</label>
                <input type="text" id="position-${experienceId}" class="position-input" value="${experienceData ? experienceData.position : ''}">
            </div>
            <div class="form-group">
                <label for="company-${experienceId}">Company</label>
                <input type="text" id="company-${experienceId}" class="company-input" value="${experienceData ? experienceData.company : ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="start-date-${experienceId}">Start Date</label>
                <input type="month" id="start-date-${experienceId}" class="start-date-input" value="${experienceData ? experienceData.startDate : ''}">
            </div>
            <div class="form-group end-date-group">
                <label for="end-date-${experienceId}">End Date</label>
                <input type="month" id="end-date-${experienceId}" class="end-date-input" ${experienceData && experienceData.current ? 'disabled' : ''} value="${experienceData && !experienceData.current ? experienceData.endDate : ''}">
                <div class="current-job">
                    <input type="checkbox" id="current-${experienceId}" class="current-checkbox" ${experienceData && experienceData.current ? 'checked' : ''}>
                    <label for="current-${experienceId}">Current job</label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="description-${experienceId}">Description</label>
            <textarea id="description-${experienceId}" class="description-input" rows="4">${experienceData ? experienceData.description : ''}</textarea>
        </div>
        <div class="item-actions">
            <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i> Remove</button>
        </div>
    `;
    
    experienceContainer.appendChild(experienceElement);
    
    // Add event listeners for the new experience
    const positionInput = experienceElement.querySelector('.position-input');
    const companyInput = experienceElement.querySelector('.company-input');
    const startDateInput = experienceElement.querySelector('.start-date-input');
    const endDateInput = experienceElement.querySelector('.end-date-input');
    const currentCheckbox = experienceElement.querySelector('.current-checkbox');
    const descriptionInput = experienceElement.querySelector('.description-input');
    const removeBtn = experienceElement.querySelector('.remove-item-btn');
    
    // Update state when inputs change
    [positionInput, companyInput, startDateInput, endDateInput, descriptionInput].forEach(input => {
        input.addEventListener('input', () => {
            updateExperiences();
        });
    });
    
    // Handle current job checkbox
    currentCheckbox.addEventListener('change', () => {
        endDateInput.disabled = currentCheckbox.checked;
        if (currentCheckbox.checked) {
            endDateInput.value = '';
        }
        updateExperiences();
    });
    
    // Remove experience when remove button clicked
    removeBtn.addEventListener('click', () => {
        experienceElement.remove();
        updateExperiences();
    });
}

// Update Experiences in App State
function updateExperiences() {
    const experienceItems = document.querySelectorAll('.experience-item');
    const experiences = [];
    
    experienceItems.forEach(item => {
        const positionInput = item.querySelector('.position-input');
        const companyInput = item.querySelector('.company-input');
        const startDateInput = item.querySelector('.start-date-input');
        const endDateInput = item.querySelector('.end-date-input');
        const currentCheckbox = item.querySelector('.current-checkbox');
        const descriptionInput = item.querySelector('.description-input');
        
        if (positionInput && companyInput) {
            experiences.push({
                id: item.getAttribute('data-experience-id'),
                position: positionInput.value,
                company: companyInput.value,
                startDate: startDateInput ? startDateInput.value : '',
                endDate: endDateInput && !currentCheckbox.checked ? endDateInput.value : '',
                current: currentCheckbox ? currentCheckbox.checked : false,
                description: descriptionInput ? descriptionInput.value : ''
            });
        }
    });
    
    appState.experience = experiences;
    updatePreview();
    updateATSScore();
}

// Education Form
function setupEducationForm() {
    const addEducationBtn = document.getElementById('add-education');
    const educationContainer = document.getElementById('education-container');
    
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', () => {
            addEducationField();
        });
    }
}

// Add Education Field
function addEducationField(educationData = null) {
    const educationContainer = document.getElementById('education-container');
    if (!educationContainer) return;
    
    const educationId = `edu-${Date.now()}`;
    const educationElement = document.createElement('div');
    educationElement.className = 'education-item';
    educationElement.setAttribute('data-education-id', educationId);
    
    educationElement.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="degree-${educationId}">Degree</label>
                <input type="text" id="degree-${educationId}" class="degree-input" value="${educationData ? educationData.degree : ''}">
            </div>
            <div class="form-group">
                <label for="institution-${educationId}">Institution</label>
                <input type="text" id="institution-${educationId}" class="institution-input" value="${educationData ? educationData.institution : ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edu-start-date-${educationId}">Start Date</label>
                <input type="month" id="edu-start-date-${educationId}" class="edu-start-date-input" value="${educationData ? educationData.startDate : ''}">
            </div>
            <div class="form-group end-date-group">
                <label for="edu-end-date-${educationId}">End Date</label>
                <input type="month" id="edu-end-date-${educationId}" class="edu-end-date-input" ${educationData && educationData.current ? 'disabled' : ''} value="${educationData && !educationData.current ? educationData.endDate : ''}">
                <div class="current-education">
                    <input type="checkbox" id="edu-current-${educationId}" class="edu-current-checkbox" ${educationData && educationData.current ? 'checked' : ''}>
                    <label for="edu-current-${educationId}">Currently studying</label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="edu-description-${educationId}">Description</label>
            <textarea id="edu-description-${educationId}" class="edu-description-input" rows="4">${educationData ? educationData.description : ''}</textarea>
        </div>
        <div class="item-actions">
            <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i> Remove</button>
        </div>
    `;
    
    educationContainer.appendChild(educationElement);
    
    // Add event listeners for the new education
    const degreeInput = educationElement.querySelector('.degree-input');
    const institutionInput = educationElement.querySelector('.institution-input');
    const startDateInput = educationElement.querySelector('.edu-start-date-input');
    const endDateInput = educationElement.querySelector('.edu-end-date-input');
    const currentCheckbox = educationElement.querySelector('.edu-current-checkbox');
    const descriptionInput = educationElement.querySelector('.edu-description-input');
    const removeBtn = educationElement.querySelector('.remove-item-btn');
    
    // Update state when inputs change
    [degreeInput, institutionInput, startDateInput, endDateInput, descriptionInput].forEach(input => {
        input.addEventListener('input', () => {
            updateEducation();
        });
    });
    
    // Handle current education checkbox
    currentCheckbox.addEventListener('change', () => {
        endDateInput.disabled = currentCheckbox.checked;
        if (currentCheckbox.checked) {
            endDateInput.value = '';
        }
        updateEducation();
    });
    
    // Remove education when remove button clicked
    removeBtn.addEventListener('click', () => {
        educationElement.remove();
        updateEducation();
    });
}

// Update Education in App State
function updateEducation() {
    const educationItems = document.querySelectorAll('.education-item');
    const education = [];
    
    educationItems.forEach(item => {
        const degreeInput = item.querySelector('.degree-input');
        const institutionInput = item.querySelector('.institution-input');
        const startDateInput = item.querySelector('.edu-start-date-input');
        const endDateInput = item.querySelector('.edu-end-date-input');
        const currentCheckbox = item.querySelector('.edu-current-checkbox');
        const descriptionInput = item.querySelector('.edu-description-input');
        
        if (degreeInput && institutionInput) {
            education.push({
                id: item.getAttribute('data-education-id'),
                degree: degreeInput.value,
                institution: institutionInput.value,
                startDate: startDateInput ? startDateInput.value : '',
                endDate: endDateInput && !currentCheckbox.checked ? endDateInput.value : '',
                current: currentCheckbox ? currentCheckbox.checked : false,
                description: descriptionInput ? descriptionInput.value : ''
            });
        }
    });
    
    appState.education = education;
    updatePreview();
    updateATSScore();
}

// Skills Form
function setupSkillsForm() {
    // Skill type selector
    const skillTypeOptions = document.querySelectorAll('.skill-type');
    skillTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.getAttribute('data-skill-type');
            selectSkillType(type);
        });
    });
    
    // Tags format
    const addTagBtn = document.getElementById('add-skill-tag');
    const tagInput = document.getElementById('skill-tag-input');
    
    if (addTagBtn && tagInput) {
        addTagBtn.addEventListener('click', () => {
            addSkillTag(tagInput.value.trim());
            tagInput.value = '';
        });
        
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && tagInput.value.trim()) {
                addSkillTag(tagInput.value.trim());
                tagInput.value = '';
                e.preventDefault();
            }
        });
    }
    
    // Suggestions
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            addSkillTag(tag.textContent.trim());
        });
    });
    
    // Add rated skill
    const addRatedSkillBtn = document.getElementById('add-rated-skill');
    const ratedSkillInput = document.getElementById('rated-skill-input');
    
    if (addRatedSkillBtn && ratedSkillInput) {
        addRatedSkillBtn.addEventListener('click', () => {
            openSkillRatingModal(ratedSkillInput.value.trim());
            ratedSkillInput.value = '';
        });
    }
    
    // Add skill category
    const addCategoryBtn = document.getElementById('add-category');
    const categoryInput = document.getElementById('category-input');
    
    if (addCategoryBtn && categoryInput) {
        addCategoryBtn.addEventListener('click', () => {
            addSkillCategory(categoryInput.value.trim());
            categoryInput.value = '';
        });
    }
}

// Select Skill Type
function selectSkillType(type) {
    const skillTypeOptions = document.querySelectorAll('.skill-type');
    const skillFormats = document.querySelectorAll('.skill-format');
    
    // Update UI
    skillTypeOptions.forEach(option => {
        if (option.getAttribute('data-skill-type') === type) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    skillFormats.forEach(format => {
        if (format.getAttribute('data-format') === type) {
            format.classList.add('active');
        } else {
            format.classList.remove('active');
        }
    });
    
    // Update state
    appState.skills.type = type;
    updatePreview();
}

// Add Skill Tag
function addSkillTag(skill) {
    if (!skill) return;
    
    const tagsContainer = document.querySelector('.skill-tags');
    if (!tagsContainer) return;
    
    // Check if skill already exists
    const existingSkills = Array.from(tagsContainer.querySelectorAll('.skill-tag'))
        .map(tag => tag.getAttribute('data-skill').toLowerCase());
    
    if (existingSkills.includes(skill.toLowerCase())) return;
    
    // Create new skill tag
    const tagElement = document.createElement('div');
    tagElement.className = 'skill-tag';
    tagElement.setAttribute('data-skill', skill);
    
    tagElement.innerHTML = `
        ${skill}
        <button type="button" class="remove-skill"><i class="fas fa-times"></i></button>
    `;
    
    tagsContainer.appendChild(tagElement);
    
    // Add event listener for remove button
    const removeBtn = tagElement.querySelector('.remove-skill');
    removeBtn.addEventListener('click', () => {
        tagElement.remove();
        updateSkills();
    });
    
    updateSkills();
}

// Update Skills in App State
function updateSkills() {
    const skillItems = [];
    
    // Get skill tags
    if (appState.skills.type === 'tags') {
        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach(tag => {
            skillItems.push({
                name: tag.getAttribute('data-skill'),
                type: 'tag'
            });
        });
    }
    
    // Get rated skills
    else if (appState.skills.type === 'rated') {
        const ratedSkills = document.querySelectorAll('.rated-skill');
        ratedSkills.forEach(skill => {
            skillItems.push({
                name: skill.querySelector('.rated-skill-name').textContent,
                rating: parseInt(skill.getAttribute('data-rating')),
                type: 'rated'
            });
        });
    }
    
    // Get categorized skills
    else if (appState.skills.type === 'categorized') {
        const categories = document.querySelectorAll('.skill-category');
        categories.forEach(category => {
            const categoryName = category.querySelector('.category-name').textContent;
            const categorySkills = [];
            
            category.querySelectorAll('.skill-tag').forEach(tag => {
                categorySkills.push(tag.getAttribute('data-skill'));
            });
            
            skillItems.push({
                name: categoryName,
                skills: categorySkills,
                type: 'category'
            });
        });
    }
    
    appState.skills.items = skillItems;
    updatePreview();
    updateATSScore();
}

// Open Skill Rating Modal
function openSkillRatingModal(skillName) {
    if (!skillName) return;
    
    const modal = document.getElementById('skill-rating-modal');
    const skillNameDisplay = document.getElementById('skill-name-display');
    const ratingSlider = document.getElementById('skill-rating-slider');
    const saveRatingBtn = document.getElementById('save-rating-btn');
    
    if (modal && skillNameDisplay && ratingSlider && saveRatingBtn) {
        skillNameDisplay.textContent = skillName;
        ratingSlider.value = 3; // Default to middle value
        
        // Update preview when slider changes
        ratingSlider.addEventListener('input', () => {
            updateSkillRatingPreview(ratingSlider.value);
        });
        
        // Set initial preview
        updateSkillRatingPreview(ratingSlider.value);
        
        // Save button event
        const saveHandler = () => {
            addRatedSkill(skillName, ratingSlider.value);
            closeModal('skill-rating-modal');
            saveRatingBtn.removeEventListener('click', saveHandler);
        };
        
        saveRatingBtn.addEventListener('click', saveHandler);
        
        // Show modal
        modal.classList.add('active');
    }
}

// Update Skill Rating Preview
function updateSkillRatingPreview(rating) {
    const skillLevelPreview = document.getElementById('skill-level-preview');
    if (!skillLevelPreview) return;
    
    const levels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const index = Math.min(Math.max(0, Math.floor(rating) - 1), 4);
    
    skillLevelPreview.textContent = levels[index];
}

// Languages Form
function setupLanguagesForm() {
    const addLanguageBtn = document.getElementById('add-language');
    
    if (addLanguageBtn) {
        addLanguageBtn.addEventListener('click', () => {
            addLanguageField();
        });
    }
}

// Add Language Field
function addLanguageField(languageData = null) {
    const languagesContainer = document.getElementById('languages-container');
    if (!languagesContainer) return;
    
    const languageId = `lang-${Date.now()}`;
    const languageElement = document.createElement('div');
    languageElement.className = 'language-item';
    languageElement.setAttribute('data-language-id', languageId);
    
    const proficiencyLevels = [
        'Native/Bilingual',
        'Fluent',
        'Advanced',
        'Intermediate',
        'Basic'
    ];
    
    let levelOptions = '';
    proficiencyLevels.forEach(level => {
        const selected = languageData && languageData.level === level ? 'selected' : '';
        levelOptions += `<option value="${level}" ${selected}>${level}</option>`;
    });
    
    languageElement.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="language-${languageId}">Language</label>
                <input type="text" id="language-${languageId}" class="language-input" value="${languageData ? languageData.name : ''}">
            </div>
            <div class="form-group">
                <label for="proficiency-${languageId}">Proficiency</label>
                <select id="proficiency-${languageId}" class="proficiency-select">
                    ${levelOptions}
                </select>
            </div>
        </div>
        <div class="language-item-actions">
            <button type="button" class="remove-language-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    languagesContainer.appendChild(languageElement);
    
    // Add event listeners
    const languageInput = languageElement.querySelector('.language-input');
    const proficiencySelect = languageElement.querySelector('.proficiency-select');
    const removeBtn = languageElement.querySelector('.remove-language-btn');
    
    // Update state when inputs change
    [languageInput, proficiencySelect].forEach(input => {
        input.addEventListener('input', () => {
            updateLanguages();
        });
    });
    
    // Remove language when remove button clicked
    removeBtn.addEventListener('click', () => {
        languageElement.remove();
        updateLanguages();
    });
}

// Update Languages in App State
function updateLanguages() {
    const languageItems = document.querySelectorAll('.language-item');
    const languages = [];
    
    languageItems.forEach(item => {
        const nameInput = item.querySelector('.language-input');
        const levelSelect = item.querySelector('.proficiency-select');
        
        if (nameInput && nameInput.value.trim() && levelSelect) {
            languages.push({
                id: item.getAttribute('data-language-id'),
                name: nameInput.value.trim(),
                level: levelSelect.value
            });
        }
    });
    
    appState.languages = languages;
    updatePreview();
    updateATSScore();
}

// Courses Form
function setupCoursesForm() {
    const addCourseBtn = document.getElementById('add-course');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            addCourseField();
        });
    }
}

// Add Course Field
function addCourseField(courseData = null) {
    const coursesContainer = document.getElementById('courses-container');
    if (!coursesContainer) return;
    
    const courseId = `course-${Date.now()}`;
    const courseElement = document.createElement('div');
    courseElement.className = 'course-item';
    courseElement.setAttribute('data-course-id', courseId);
    
    courseElement.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="course-name-${courseId}">Course Name</label>
                <input type="text" id="course-name-${courseId}" class="course-name-input" value="${courseData ? courseData.name : ''}">
            </div>
            <div class="form-group">
                <label for="course-provider-${courseId}">Provider</label>
                <input type="text" id="course-provider-${courseId}" class="course-provider-input" value="${courseData ? courseData.provider : ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="course-date-${courseId}">Date Completed</label>
                <input type="month" id="course-date-${courseId}" class="course-date-input" value="${courseData ? courseData.date : ''}">
            </div>
            <div class="form-group">
                <label for="course-url-${courseId}">Certificate URL (optional)</label>
                <input type="url" id="course-url-${courseId}" class="course-url-input" value="${courseData ? courseData.url : ''}">
            </div>
        </div>
        <div class="item-actions">
            <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i> Remove</button>
        </div>
    `;
    
    coursesContainer.appendChild(courseElement);
    
    // Add event listeners
    const nameInput = courseElement.querySelector('.course-name-input');
    const providerInput = courseElement.querySelector('.course-provider-input');
    const dateInput = courseElement.querySelector('.course-date-input');
    const urlInput = courseElement.querySelector('.course-url-input');
    const removeBtn = courseElement.querySelector('.remove-item-btn');
    
    // Update state when inputs change
    [nameInput, providerInput, dateInput, urlInput].forEach(input => {
        input.addEventListener('input', () => {
            updateCourses();
        });
    });
    
    // Remove course when remove button clicked
    removeBtn.addEventListener('click', () => {
        courseElement.remove();
        updateCourses();
    });
}

// Update Courses in App State
function updateCourses() {
    const courseItems = document.querySelectorAll('.course-item');
    const courses = [];
    
    courseItems.forEach(item => {
        const nameInput = item.querySelector('.course-name-input');
        const providerInput = item.querySelector('.course-provider-input');
        const dateInput = item.querySelector('.course-date-input');
        const urlInput = item.querySelector('.course-url-input');
        
        if (nameInput && nameInput.value.trim() && providerInput) {
            courses.push({
                id: item.getAttribute('data-course-id'),
                name: nameInput.value.trim(),
                provider: providerInput.value.trim(),
                date: dateInput ? dateInput.value : '',
                url: urlInput ? urlInput.value : ''
            });
        }
    });
    
    appState.courses = courses;
    updatePreview();
    updateATSScore();
}

// Projects Form
function setupProjectsForm() {
    const addProjectBtn = document.getElementById('add-project');
    
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            addProjectField();
        });
    }
}

// Add Project Field
function addProjectField(projectData = null) {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    
    const projectId = `project-${Date.now()}`;
    const projectElement = document.createElement('div');
    projectElement.className = 'project-item';
    projectElement.setAttribute('data-project-id', projectId);
    
    projectElement.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="project-name-${projectId}">Project Name</label>
                <input type="text" id="project-name-${projectId}" class="project-name-input" value="${projectData ? projectData.name : ''}">
            </div>
            <div class="form-group">
                <label for="project-date-${projectId}">Date</label>
                <input type="month" id="project-date-${projectId}" class="project-date-input" value="${projectData ? projectData.date : ''}">
            </div>
        </div>
        <div class="form-group">
            <label for="project-description-${projectId}">Description</label>
            <textarea id="project-description-${projectId}" class="project-description-input" rows="4">${projectData ? projectData.description : ''}</textarea>
        </div>
        <div class="form-group">
            <label for="project-url-${projectId}">Project URL (optional)</label>
            <input type="url" id="project-url-${projectId}" class="project-url-input" value="${projectData ? projectData.url : ''}">
        </div>
        <div class="item-actions">
            <button type="button" class="remove-item-btn"><i class="fas fa-trash"></i> Remove</button>
        </div>
    `;
    
    projectsContainer.appendChild(projectElement);
    
    // Add event listeners
    const nameInput = projectElement.querySelector('.project-name-input');
    const dateInput = projectElement.querySelector('.project-date-input');
    const descriptionInput = projectElement.querySelector('.project-description-input');
    const urlInput = projectElement.querySelector('.project-url-input');
    const removeBtn = projectElement.querySelector('.remove-item-btn');
    
    // Update state when inputs change
    [nameInput, dateInput, descriptionInput, urlInput].forEach(input => {
        input.addEventListener('input', () => {
            updateProjects();
        });
    });
    
    // Remove project when remove button clicked
    removeBtn.addEventListener('click', () => {
        projectElement.remove();
        updateProjects();
    });
}

// Update Projects in App State
function updateProjects() {
    const projectItems = document.querySelectorAll('.project-item');
    const projects = [];
    
    projectItems.forEach(item => {
        const nameInput = item.querySelector('.project-name-input');
        const dateInput = item.querySelector('.project-date-input');
        const descriptionInput = item.querySelector('.project-description-input');
        const urlInput = item.querySelector('.project-url-input');
        
        if (nameInput && nameInput.value.trim()) {
            projects.push({
                id: item.getAttribute('data-project-id'),
                name: nameInput.value.trim(),
                date: dateInput ? dateInput.value : '',
                description: descriptionInput ? descriptionInput.value : '',
                url: urlInput ? urlInput.value : ''
            });
        }
    });
    
    appState.projects = projects;
    updatePreview();
    updateATSScore();
}

// Modal Event Listeners
function setupModalEventListeners() {
    // Close buttons for all modals
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    closeButtons.forEach(button => {
        const modal = button.closest('.modal');
        if (modal) {
            button.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Custom section modal
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
            const modal = document.getElementById('section-type-modal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }
    
    // Section type options
    const sectionTypeOptions = document.querySelectorAll('.section-type-option');
    sectionTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sectionTypeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Add custom section button
    const addCustomSectionBtn = document.getElementById('add-custom-section-btn');
    if (addCustomSectionBtn) {
        addCustomSectionBtn.addEventListener('click', () => {
            const activeOption = document.querySelector('.section-type-option.active');
            if (activeOption) {
                const sectionType = activeOption.getAttribute('data-section-type');
                addCustomSection(sectionType);
                closeModal('section-type-modal');
            }
        });
    }
}

// Theme Functions
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('resumeBuilderTheme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = true;
        }
        appState.darkMode = true;
    }
}

function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        if (themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('resumeBuilderTheme', 'dark');
            appState.darkMode = true;
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('resumeBuilderTheme', 'light');
            appState.darkMode = false;
        }
    }
    updatePreview();
}

// Initialize Templates
function initTemplates() {
    // Set the default template
    const defaultTemplate = appState.currentTemplate;
    
    // Update template cards UI
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        const template = card.getAttribute('data-template');
        if (template === defaultTemplate) {
            card.classList.add('active');
        }
    });
}

// Select Template
function selectTemplate(template) {
    // Update UI
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        if (card.getAttribute('data-template') === template) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Update app state
    appState.currentTemplate = template;
    
    // Update preview
    updatePreview();
    
    // Show notification
    showNotification('Template updated successfully!', 'success');
}

// Save Resume
function saveResume() {
    try {
        // Save to localStorage
        localStorage.setItem('resumeBuilderData', JSON.stringify(appState));
        
        // Show success notification
        showNotification('Resume saved successfully!', 'success');
    } catch (error) {
        // Show error notification
        showNotification('Failed to save resume. Please try again.', 'error');
        console.error('Save error:', error);
    }
}

// Download Resume
function downloadResume() {
    try {
        // Show loading overlay
        showLoading('Generating PDF...');
        
        // Get the resume element
        const resumeElement = document.querySelector('.resume');
        
        if (!resumeElement) {
            throw new Error('Resume element not found');
        }
        
        // Use html2pdf library to generate PDF
        const options = {
            margin: 0,
            filename: `${appState.personalInfo.fullName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Generate PDF
        html2pdf()
            .set(options)
            .from(resumeElement)
            .save()
            .then(() => {
                // Hide loading overlay
                hideLoading();
                // Show success notification
                showNotification('Resume downloaded successfully!', 'success');
            })
            .catch(error => {
                // Hide loading overlay
                hideLoading();
                // Show error notification
                showNotification('Failed to download resume. Please try again.', 'error');
                console.error('Download error:', error);
            });
    } catch (error) {
        // Hide loading overlay
        hideLoading();
        // Show error notification
        showNotification('Failed to download resume. Please try again.', 'error');
        console.error('Download error:', error);
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle notification-icon"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle notification-icon"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle notification-icon"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle notification-icon"></i>';
    }
    
    notification.innerHTML = `
        ${icon}
        <div class="notification-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after timeout
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Show Loading Overlay
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(overlay);
}

// Hide Loading Overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function activateSection(section) {
    // Update section navigation
    const sectionItems = document.querySelectorAll('.section-item');
    sectionItems.forEach(item => {
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update form sections
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(form => {
        if (form.getAttribute('data-section') === section) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
    
    // Update app state
    appState.currentSection = section;
}

// Update ATS Score
function updateATSScore() {
    // This is a simplified version of ATS scoring
    // In a real application, this would be more complex
    
    let score = 0;
    let totalPoints = 0;
    
    // Personal information (20 points)
    const personalInfo = appState.personalInfo;
    totalPoints += 20;
    
    if (personalInfo.fullName) score += 4;
    if (personalInfo.jobTitle) score += 4;
    if (personalInfo.email) score += 4;
    if (personalInfo.phone) score += 3;
    if (personalInfo.location) score += 3;
    if (personalInfo.links.length > 0) score += 2;
    
    // Professional summary (15 points)
    totalPoints += 15;
    if (appState.summary) {
        const summaryLength = appState.summary.length;
        if (summaryLength > 400) score += 15;
        else if (summaryLength > 300) score += 12;
        else if (summaryLength > 200) score += 9;
        else if (summaryLength > 100) score += 6;
        else if (summaryLength > 0) score += 3;
    }
    
    // Work experience (25 points)
    totalPoints += 25;
    const experienceCount = appState.experience.length;
    
    if (experienceCount >= 3) score += 10;
    else if (experienceCount === 2) score += 7;
    else if (experienceCount === 1) score += 5;
    
    // Check if experiences have good descriptions
    appState.experience.forEach(exp => {
        if (exp.description && exp.description.length > 150) score += 5;
        else if (exp.description && exp.description.length > 50) score += 3;
        else if (exp.description) score += 1;
    });
    
    // Education (15 points)
    totalPoints += 15;
    const educationCount = appState.education.length;
    
    if (educationCount >= 2) score += 8;
    else if (educationCount === 1) score += 5;
    
    // Check if education entries have good descriptions
    appState.education.forEach(edu => {
        if (edu.description && edu.description.length > 100) score += 4;
        else if (edu.description && edu.description.length > 30) score += 2;
        else if (edu.description) score += 1;
    });
    
    // Skills (15 points)
    totalPoints += 15;
    const skillCount = appState.skills.items.length;
    
    if (skillCount >= 10) score += 15;
    else if (skillCount >= 7) score += 10;
    else if (skillCount >= 5) score += 7;
    else if (skillCount >= 3) score += 5;
    else if (skillCount > 0) score += 3;
    
    // Additional sections (10 points)
    totalPoints += 10;
    let additionalPoints = 0;
    
    if (appState.languages.length > 0) additionalPoints += 3;
    if (appState.courses.length > 0) additionalPoints += 3;
    if (appState.projects.length > 0) additionalPoints += 4;
    
    // Add custom sections
    const customSectionCount = Object.keys(appState.customSections).length;
    if (customSectionCount > 0) additionalPoints += customSectionCount * 2;
    
    // Cap at 10 points
    additionalPoints = Math.min(additionalPoints, 10);
    score += additionalPoints;
    
    // Calculate percentage
    const percentage = Math.round((score / totalPoints) * 100);
    
    // Update app state
    appState.atsScore = percentage;
    
    // Update UI
    updateATSScoreUI(percentage);
}

// Update ATS Score UI
function updateATSScoreUI(score) {
    const scoreCircleElement = document.querySelector('.score-circle');
    if (scoreCircleElement) {
        // You could use a library here for a proper circle visualization
        // For simplicity, we'll just update the text
        scoreCircleElement.innerHTML = `
            <div style="font-size: 2rem; font-weight: bold; color: ${getScoreColor(score)}">
                ${score}%
            </div>
        `;
    }
    
    // Update tips
    updateATSTips(score);
}

// Get score color based on value
function getScoreColor(score) {
    if (score >= 90) return 'var(--success-color)';
    if (score >= 70) return '#88c34a';
    if (score >= 50) return 'var(--warning-color)';
    return 'var(--error-color)';
}

// Update ATS Tips
function updateATSTips(score) {
    const tipsContainer = document.querySelector('.ats-tips');
    if (!tipsContainer) return;
    
    tipsContainer.innerHTML = '';
    
    // Add tips based on app state
    const tips = [];
    
    // Personal information tips
    if (!appState.personalInfo.fullName) {
        tips.push({
            text: 'Add your full name to improve your resume',
            warning: true
        });
    } else {
        tips.push({
            text: 'Good job including your name',
            warning: false
        });
    }
    
    if (!appState.personalInfo.jobTitle) {
        tips.push({
            text: 'Add a job title to improve ATS compatibility',
            warning: true
        });
    }
    
    // Professional summary tips
    if (!appState.summary) {
        tips.push({
            text: 'Add a professional summary to stand out',
            warning: true
        });
    } else if (appState.summary.length < 200) {
        tips.push({
            text: 'Consider expanding your professional summary',
            warning: true
        });
    } else {
        tips.push({
            text: 'Great professional summary length',
            warning: false
        });
    }
    
    // Experience tips
    if (appState.experience.length === 0) {
        tips.push({
            text: 'Add work experience to improve your resume',
            warning: true
        });
    } else if (appState.experience.length < 2) {
        tips.push({
            text: 'Consider adding more work experiences',
            warning: true
        });
    } else {
        tips.push({
            text: 'Good job including multiple work experiences',
            warning: false
        });
    }
    
    // Skills tips
    if (appState.skills.items.length < 5) {
        tips.push({
            text: 'Add more skills to improve ATS compatibility',
            warning: true
        });
    } else {
        tips.push({
            text: 'Good job listing your skills',
            warning: false
        });
    }
    
    // Render tips (limited to 5)
    tips.slice(0, 5).forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = `tip ${tip.warning ? 'warning' : ''}`;
        tipElement.innerHTML = `
            <i class="fas ${tip.warning ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${tip.text}</span>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

// Update Preview
function updatePreview() {
    const resumeContainer = document.querySelector('.resume');
    if (!resumeContainer) return;
    
    // Apply template-specific classes
    resumeContainer.className = `resume template-${appState.currentTemplate}`;
    
    // Create resume content structure
    createResumeHeader(resumeContainer);
    createResumeBody(resumeContainer);
}

// Create Resume Header
function createResumeHeader(container) {
    const header = container.querySelector('.resume-header') || document.createElement('div');
    header.className = 'resume-header';
    
    const personalInfo = appState.personalInfo;
    
    // Create name, title, and contact info
    header.innerHTML = `
        <div class="resume-name">${personalInfo.fullName || 'Your Name'}</div>
        <div class="resume-title">${personalInfo.jobTitle || 'Your Title'}</div>
        <div class="resume-contact">
            ${personalInfo.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${personalInfo.location}</div>` : ''}
            ${personalInfo.links.map(link => `
                <div class="contact-item">
                    <i class="fab fa-${link.type === 'other' ? 'link' : link.type}"></i>
                    <a href="${link.url}" target="_blank">${getLinkLabel(link)}</a>
                </div>
            `).join('')}
        </div>
    `;
    
    if (!container.contains(header)) {
        container.appendChild(header);
    }
}

// Get Link Label
function getLinkLabel(link) {
    // Extract domain for display
    try {
        const url = new URL(link.url);
        return url.hostname.replace('www.', '');
    } catch (e) {
        return link.type;
    }
}

// Create Resume Body
function createResumeBody(container) {
    let body = container.querySelector('.resume-body');
    
    if (!body) {
        body = document.createElement('div');
        body.className = 'resume-body';
        container.appendChild(body);
    } else {
        body.innerHTML = '';
    }
    
    // Add sections based on template and data
    
    // Summary Section
    if (appState.summary) {
        body.appendChild(createSummarySection());
    }
    
    // Experience Section
    if (appState.experience.length > 0) {
        body.appendChild(createExperienceSection());
    }
    
    // Education Section
    if (appState.education.length > 0) {
        body.appendChild(createEducationSection());
    }
    
    // Skills Section
    if (appState.skills.items.length > 0) {
        body.appendChild(createSkillsSection());
    }
    
    // Languages Section
    if (appState.languages.length > 0) {
        body.appendChild(createLanguagesSection());
    }
    
    // Courses Section
    if (appState.courses.length > 0) {
        body.appendChild(createCoursesSection());
    }
    
    // Projects Section
    if (appState.projects.length > 0) {
        body.appendChild(createProjectsSection());
    }
    
    // Custom Sections
    for (const [key, section] of Object.entries(appState.customSections)) {
        body.appendChild(createCustomSection(key, section));
    }
}

// Create Summary Section
function createSummarySection() {
    const section = document.createElement('div');
    section.className = 'resume-section summary-section';
    
    section.innerHTML = `
        <div class="section-title">Professional Summary</div>
        <div class="section-content">${appState.summary}</div>
    `;
    
    return section;
}

// Create Experience Section
function createExperienceSection() {
    const section = document.createElement('div');
    section.className = 'resume-section experience-section';
    
    let content = `<div class="section-title">Work Experience</div><div class="section-content">`;
    
    // Sort experiences by date (most recent first)
    const sortedExperiences = [...appState.experience].sort((a, b) => {
        if (a.current) return -1;
        if (b.current) return 1;
        return new Date(b.endDate || Date.now()) - new Date(a.endDate || Date.now());
    });
    
    sortedExperiences.forEach(exp => {
        const startDate = exp.startDate ? formatDate(exp.startDate, 'MMM YYYY') : '';
        const endDate = exp.current ? 'Present' : (exp.endDate ? formatDate(exp.endDate, 'MMM YYYY') : '');
        const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';
        
        content += `
            <div class="experience-entry">
                <div class="entry-header">
                    <div class="position">${exp.position}</div>
                    <div class="date">${dateRange}</div>
                </div>
                <div class="company">${exp.company}</div>
                ${exp.description ? `
                    <div class="entry-details">
                        ${formatDescription(exp.description)}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    content += `</div>`;
    section.innerHTML = content;
    
    return section;
}

// Format Date
function formatDate(dateString, format) {
    try {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        
        return format.replace('MMM', month).replace('YYYY', year);
    } catch (e) {
        return dateString;
    }
}

// Format Description
function formatDescription(description) {
    // Check if description already has bullet points or paragraphs
    if (description.includes('<li>') || description.includes('<p>')) {
        return description;
    }
    
    // Split by new lines and create list items
    const lines = description.split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
        return `<ul>${lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
    } else {
        return `<p>${description}</p>`;
    }
}

// Add Rated Skill
function addRatedSkill(skillName, rating) {
    if (!skillName) return;
    
    const skillsContainer = document.querySelector('.rated-skills-container');
    if (!skillsContainer) return;
    
    // Check if skill already exists
    const existingSkill = Array.from(skillsContainer.querySelectorAll('.rated-skill'))
        .find(skill => skill.querySelector('.rated-skill-name').textContent.toLowerCase() === skillName.toLowerCase());
    
    if (existingSkill) {
        // Update existing skill rating
        existingSkill.setAttribute('data-rating', rating);
        const ratingFill = existingSkill.querySelector('.rating-fill');
        if (ratingFill) {
            ratingFill.style.width = `${(rating / 5) * 100}%`;
        }
    } else {
        // Create new skill
        const skillElement = document.createElement('div');
        skillElement.className = 'rated-skill';
        skillElement.setAttribute('data-rating', rating);
        
        skillElement.innerHTML = `
            <div class="rated-skill-name">${skillName}</div>
            <div class="rating-bar">
                <div class="rating-fill" style="width: ${(rating / 5) * 100}%"></div>
            </div>
            <div class="rating-actions">
                <button type="button" class="edit-rating"><i class="fas fa-edit"></i></button>
                <button type="button" class="remove-rating"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        skillsContainer.appendChild(skillElement);
        
        // Add event listeners
        const editBtn = skillElement.querySelector('.edit-rating');
        const removeBtn = skillElement.querySelector('.remove-rating');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                openSkillRatingModal(skillName, rating);
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                skillElement.remove();
                updateSkills();
            });
        }
    }
    
    updateSkills();
}

// Add Skill Category
function addSkillCategory(categoryName) {
    if (!categoryName) return;
    
    const categoriesContainer = document.querySelector('.skill-categories-container');
    if (!categoriesContainer) return;
    
    // Check if category already exists
    const existingCategory = Array.from(categoriesContainer.querySelectorAll('.skill-category'))
        .find(category => category.querySelector('.category-name').textContent.toLowerCase() === categoryName.toLowerCase());
    
    if (existingCategory) return;
    
    // Create new category
    const categoryElement = document.createElement('div');
    categoryElement.className = 'skill-category';
    categoryElement.setAttribute('data-category', categoryName);
    
    categoryElement.innerHTML = `
        <div class="skill-category-header">
            <span class="category-name">${categoryName}</span>
            <button type="button" class="remove-category"><i class="fas fa-times"></i></button>
        </div>
        <div class="category-skills" data-category="${categoryName}">
            <!-- Skills will be added here -->
        </div>
        <div class="skill-input-group">
            <input type="text" class="category-skill-input" placeholder="Add a skill...">
            <button type="button" class="add-category-skill-btn"><i class="fas fa-plus"></i></button>
        </div>
    `;
    
    categoriesContainer.appendChild(categoryElement);
    
    // Add event listeners
    const removeBtn = categoryElement.querySelector('.remove-category');
    const addSkillBtn = categoryElement.querySelector('.add-category-skill-btn');
    const skillInput = categoryElement.querySelector('.category-skill-input');
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            categoryElement.remove();
            updateSkills();
        });
    }
    
    if (addSkillBtn && skillInput) {
        addSkillBtn.addEventListener('click', () => {
            addCategorySkill(categoryName, skillInput.value.trim());
            skillInput.value = '';
        });
        
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && skillInput.value.trim()) {
                addCategorySkill(categoryName, skillInput.value.trim());
                skillInput.value = '';
                e.preventDefault();
            }
        });
    }
    
    updateSkills();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        // Clear event listeners from modal elements by cloning and replacing them
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            const newModalContent = modalContent.cloneNode(true);
            modalContent.parentNode.replaceChild(newModalContent, modalContent);
        }
    }
}

function addCategorySkill(categoryName, skillName) {
    if (!categoryName || !skillName) return;
    
    const categorySkillsContainer = document.querySelector(`.category-skills[data-category="${categoryName}"]`);
    if (!categorySkillsContainer) return;
    
    // Check if skill already exists
    const existingSkills = Array.from(categorySkillsContainer.querySelectorAll('.skill-tag'))
        .map(tag => tag.getAttribute('data-skill').toLowerCase());
    
    if (existingSkills.includes(skillName.toLowerCase())) return;
    
    // Create new skill tag
    const tagElement = document.createElement('div');
    tagElement.className = 'skill-tag';
    tagElement.setAttribute('data-skill', skillName);
    
    tagElement.innerHTML = `
        ${skillName}
        <button type="button" class="remove-skill"><i class="fas fa-times"></i></button>
    `;
    
    categorySkillsContainer.appendChild(tagElement);
    
    // Add event listener for remove button
    const removeBtn = tagElement.querySelector('.remove-skill');
    removeBtn.addEventListener('click', () => {
        tagElement.remove();
        updateSkills();
    });
    
    updateSkills();
}

// Create Education Section
function createEducationSection() {
    const section = document.createElement('div');
    section.className = 'resume-section education-section';
    
    let content = `<div class="section-title">Education</div><div class="section-content">`;
    
    // Sort education by date (most recent first)
    const sortedEducation = [...appState.education].sort((a, b) => {
        if (a.current) return -1;
        if (b.current) return 1;
        return new Date(b.endDate || Date.now()) - new Date(a.endDate || Date.now());
    });
    
    sortedEducation.forEach(edu => {
        const startDate = edu.startDate ? formatDate(edu.startDate, 'MMM YYYY') : '';
        const endDate = edu.current ? 'Present' : (edu.endDate ? formatDate(edu.endDate, 'MMM YYYY') : '');
        const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';
        
        content += `
            <div class="education-entry">
                <div class="entry-header">
                    <div class="degree">${edu.degree}</div>
                    <div class="date">${dateRange}</div>
                </div>
                <div class="institution">${edu.institution}</div>
                ${edu.description ? `
                    <div class="entry-details">
                        ${formatDescription(edu.description)}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    content += `</div>`;
    section.innerHTML = content;
    
    return section;
}

// Create Skills Section
function createSkillsSection() {
    const section = document.createElement('div');
    section.className = 'resume-section skills-section';
    
    let content = `<div class="section-title">Skills</div><div class="section-content">`;
    
    // Different rendering based on skill type
    if (appState.skills.type === 'tags') {
        content += `<div class="skills-list">`;
        appState.skills.items.forEach(skill => {
            content += `<div class="skill">${skill.name}</div>`;
        });
        content += `</div>`;
    } else if (appState.skills.type === 'rated') {
        content += `<div class="rated-skills-list">`;
        appState.skills.items.forEach(skill => {
            content += `
                <div class="rated-skill-entry">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-rating">
                        ${createRatingStars(skill.rating)}
                    </div>
                </div>
            `;
        });
        content += `</div>`;
    } else if (appState.skills.type === 'categorized') {
        content += `<div class="categorized-skills">`;
        appState.skills.items.forEach(category => {
            content += `
                <div class="skill-category-entry">
                    <div class="category-title">${category.name}</div>
                    <div class="category-skills-list">
                        ${category.skills.map(skill => `<div class="skill">${skill}</div>`).join('')}
                    </div>
                </div>
            `;
        });
        content += `</div>`;
    }
    
    content += `</div>`;
    section.innerHTML = content;
    
    return section;
}

// Create Rating Stars
function createRatingStars(rating) {
    const maxRating = 5;
    let stars = '';
    for (let i = 1; i <= maxRating; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Create Languages Section
function createLanguagesSection() {
    const section = document.createElement('div');
    section.className = 'resume-section languages-section';
    
    let content = `<div class="section-title">Languages</div><div class="section-content"><div class="languages-list">`;
    
    appState.languages.forEach(language => {
        content += `
            <div class="language-entry">
                <div class="language-name">${language.name}</div>
                <div class="language-level">${language.level}</div>
            </div>
        `;
    });
    
    content += `</div></div>`;
    section.innerHTML = content;
    
    return section;
}

// Create Courses Section
function createCoursesSection() {
    const section = document.createElement('div');
    section.className = 'resume-section courses-section';
    
    let content = `<div class="section-title">Courses & Certifications</div><div class="section-content"><div class="courses-list">`;
    
    appState.courses.forEach(course => {
        content += `
            <div class="course-entry">
                <div class="course-name">${course.name}</div>
                <div class="course-provider">${course.provider}</div>
                ${course.date ? `<div class="course-date">${formatDate(course.date, 'MMM YYYY')}</div>` : ''}
            </div>
        `;
    });
    
    content += `</div></div>`;
    section.innerHTML = content;
    
    return section;
}

// Create Projects Section
function createProjectsSection() {
    const section = document.createElement('div');
    section.className = 'resume-section projects-section';
    
    let content = `<div class="section-title">Projects</div><div class="section-content">`;
    
    appState.projects.forEach(project => {
        content += `
            <div class="project-entry">
                <div class="project-header">
                    <div class="project-name">${project.name}</div>
                    ${project.date ? `<div class="project-date">${formatDate(project.date, 'MMM YYYY')}</div>` : ''}
                </div>
                ${project.description ? `
                    <div class="project-description">
                        ${formatDescription(project.description)}
                    </div>
                ` : ''}
                ${project.url ? `
                    <div class="project-link">
                        <a href="${project.url}" target="_blank">${project.url}</a>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    content += `</div>`;
    section.innerHTML = content;
    
    return section;
}

// Create Custom Section
function createCustomSection(id, section) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'resume-section custom-section';
    sectionElement.setAttribute('data-section-id', id);
    
    sectionElement.innerHTML = `
        <div class="section-title">${section.title}</div>
        <div class="section-content">${section.content}</div>
    `;
    
    return sectionElement;
}

// Add Custom Section
function addCustomSection(sectionType) {
    // Generate unique ID for section
    const sectionId = `custom-${Date.now()}`;
    
    // Create section based on type
    let sectionTitle = '';
    let sectionContent = '';
    
    switch (sectionType) {
        case 'achievements':
            sectionTitle = 'Achievements & Awards';
            sectionContent = '<ul><li>Add your achievements here</li></ul>';
            break;
        case 'interests':
            sectionTitle = 'Interests & Hobbies';
            sectionContent = '<p>Add your interests and hobbies here</p>';
            break;
        case 'publications':
            sectionTitle = 'Publications';
            sectionContent = '<ul><li>Add your publications here</li></ul>';
            break;
        case 'references':
            sectionTitle = 'References';
            sectionContent = '<p>Available upon request</p>';
            break;
        case 'custom':
            sectionTitle = 'Custom Section';
            sectionContent = '<p>Add your content here</p>';
            break;
    }
    
    // Add to app state
    appState.customSections[sectionId] = {
        title: sectionTitle,
        content: sectionContent,
        type: sectionType
    };
    
    // Add to sidebar
    addSectionToSidebar(sectionId, sectionTitle, sectionType);
    
    // Add to form container
    addCustomSectionForm(sectionId, sectionTitle, sectionContent);
    
    // Update preview
    updatePreview();
}

// Add Section to Sidebar
function addSectionToSidebar(sectionId, sectionTitle, sectionType) {
    const sectionsList = document.querySelector('.sections-list');
    if (!sectionsList) return;
    
    const sectionItem = document.createElement('div');
    sectionItem.className = 'section-item';
    sectionItem.setAttribute('data-section', sectionId);
    
    let iconClass = 'fa-list';
    switch (sectionType) {
        case 'achievements':
            iconClass = 'fa-trophy';
            break;
        case 'interests':
            iconClass = 'fa-heart';
            break;
        case 'publications':
            iconClass = 'fa-book';
            break;
        case 'references':
            iconClass = 'fa-user-friends';
            break;
    }
    
    sectionItem.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${sectionTitle}</span>
    `;
    
    sectionsList.appendChild(sectionItem);
    
    // Add event listener
    sectionItem.addEventListener('click', () => {
        activateSection(sectionId);
    });
}

// Add Custom Section Form
function addCustomSectionForm(sectionId, sectionTitle, sectionContent) {
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) return;
    
    const formSection = document.createElement('div');
    formSection.className = 'form-section';
    formSection.setAttribute('data-section', sectionId);
    
    formSection.innerHTML = `
        <h2>${sectionTitle}</h2>
        <div class="form-group">
            <label for="${sectionId}-title">Section Title</label>
            <input type="text" id="${sectionId}-title" class="section-title-input" value="${sectionTitle}">
        </div>
        <div class="form-group">
            <label for="${sectionId}-content">Content</label>
            <textarea id="${sectionId}-content" class="section-content-input" rows="10">${sectionContent}</textarea>
        </div>
        <div class="section-actions">
            <button type="button" class="remove-section-btn"><i class="fas fa-trash"></i> Remove Section</button>
        </div>
    `;
    
    editorContainer.appendChild(formSection);
    
    // Add event listeners
    const titleInput = formSection.querySelector('.section-title-input');
    const contentInput = formSection.querySelector('.section-content-input');
    const removeBtn = formSection.querySelector('.remove-section-btn');
    
    // Update state when inputs change
    [titleInput, contentInput].forEach(input => {
        input.addEventListener('input', () => {
            updateCustomSection(sectionId);
        });
    });
    
    // Remove section when remove button clicked
    removeBtn.addEventListener('click', () => {
        removeCustomSection(sectionId);
    });
}

// Update Custom Section
function updateCustomSection(sectionId) {
    const titleInput = document.getElementById(`${sectionId}-title`);
    const contentInput = document.getElementById(`${sectionId}-content`);
    
    if (titleInput && contentInput && appState.customSections[sectionId]) {
        appState.customSections[sectionId].title = titleInput.value.trim();
        appState.customSections[sectionId].content = contentInput.value;
        
        // Update sidebar title
        const sidebarItem = document.querySelector(`.section-item[data-section="${sectionId}"] span`);
        if (sidebarItem) {
            sidebarItem.textContent = titleInput.value.trim();
        }
        
        // Update preview
        updatePreview();
    }
}

// Remove Custom Section
function removeCustomSection(sectionId) {
    // Remove from app state
    delete appState.customSections[sectionId];
    
    // Remove from sidebar
    const sidebarItem = document.querySelector(`.section-item[data-section="${sectionId}"]`);
    if (sidebarItem) {
        sidebarItem.remove();
    }
    
    // Remove from form container
    const formSection = document.querySelector(`.form-section[data-section="${sectionId}"]`);
    if (formSection) {
        formSection.remove();
    }
    
    // Activate personal section
    activateSection('personal');
    
    // Update preview
    updatePreview();
} 
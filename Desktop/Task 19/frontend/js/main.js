document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const projectsContainer = document.getElementById('projects-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters');
    const emptyState = document.getElementById('empty-state');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Lightbox Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');

    // API URL
    const API_URL = 'http://localhost:5000/api/projects';

    // State
    let currentCategory = 'All';
    let currentSearch = '';

    // Initialize
    init();

    function init() {
        // Check for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
        }

        setupEventListeners();
        fetchAndRenderProjects();
    }

    function setupEventListeners() {
        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            if (document.body.getAttribute('data-theme') === 'light') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
            }
        });

        // Search Input with Debounce
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                currentSearch = e.target.value.trim();
                fetchAndRenderProjects();
            }, 500);
        });

        // Category Filters
        categoryFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Update active class
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                currentCategory = e.target.getAttribute('data-filter');
                fetchAndRenderProjects();
            }
        });

        // Lightbox Close Events
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    async function fetchAndRenderProjects() {
        renderSkeletons();
        
        try {
            // Build query params
            const params = new URLSearchParams();
            if (currentCategory !== 'All') params.append('category', currentCategory);
            if (currentSearch) params.append('search', currentSearch);

            const url = `${API_URL}?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch projects');
            
            const projects = await response.json();
            renderProjects(projects);
            
        } catch (error) {
            console.error('Error:', error);
            projectsContainer.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1">Failed to load projects. Ensure backend is running.</p>';
        }
    }

    function renderSkeletons() {
        emptyState.classList.add('hidden');
        projectsContainer.innerHTML = Array(6).fill('<div class="skeleton"></div>').join('');
    }

    function renderProjects(projects) {
        if (projects.length === 0) {
            projectsContainer.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        projectsContainer.innerHTML = projects.map((project, index) => {
            const delay = index * 0.1; // Staggered animation delay
            return `
            <div class="project-card" style="animation-delay: ${delay}s">
                <div class="card-img-wrapper" onclick="openLightbox(${project.id})">
                    <img src="${project.image_url}" alt="${project.title}" loading="lazy">
                    <div class="card-overlay">
                        <button class="preview-btn"><i class='bx bx-zoom-in'></i></button>
                    </div>
                </div>
                <div class="card-content">
                    <span class="card-category">${project.category}</span>
                    <h3 class="card-title">${project.title}</h3>
                    <p class="card-desc">${project.description}</p>
                    <div class="card-tech">
                        ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                    </div>
                    <div class="card-actions">
                        <a href="${project.live_demo_link}" target="_blank" class="btn btn-primary">
                            <i class='bx bx-link-external'></i> Live Demo
                        </a>
                        <a href="${project.github_link}" target="_blank" class="btn btn-secondary">
                            <i class='bx bxl-github'></i> Source
                        </a>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Store projects globally for lightbox access
        window.currentProjects = projects;
    }

    window.openLightbox = function(projectId) {
        const project = window.currentProjects.find(p => p.id === projectId);
        if (!project) return;

        lightboxImg.src = project.image_url;
        lightboxImg.alt = project.title;
        lightboxTitle.textContent = project.title;
        lightboxDesc.textContent = project.description;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    };

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300); // Clear after transition
    }
});

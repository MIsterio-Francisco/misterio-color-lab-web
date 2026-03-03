// Misterio Color Lab - Advanced Logic & i18n
document.addEventListener('DOMContentLoaded', () => {
    let currentLang = document.body.getAttribute('data-lang') || 'en';

    // --- All poster filenames for the carousel ---
    const allPosters = [
        "BARRA_BRAVA.png",
        "EL SANTO.png",
        "HBO_MUXES.webp",
        "LA_BODA.jpg",
        "LA_ESPERA.jpg",
        "MV5BMmFmM2Y2YTEtNWNlYi00ZmIyLTgzNzktZTNmY2RkODE2MjY0XkEyXkFqcGc@._V1_.jpg",
        "MV5BMzE5OTA2NjEtODY3NC00MDYzLTg0YTktMmQxNjY1NjJiMWZjXkEyXkFqcGc@._V1_.jpg",
        "MV5BMzYwMDkwYTctZTM2Zi00ZjNlLWI4MmItYzNlNmNmOGJkYThjXkEyXkFqcGc@._V1_.jpg",
        "MV5BNDAwYmE3Y2EtMDU4MS00NWE1LWI4NzEtM2EyNTEzM2FjY2Q3XkEyXkFqcGc@._V1_.jpg",
        "MV5BNDIwYmFjM2ItYTYwZi00ODk5LWE1MDQtMjM3MmRmYmEyNDhjXkEyXkFqcGc@._V1_.jpg",
        "MV5BNGI1OGQ0Y2YtY2RmNi00MmJmLThhYzktNWU2NWRkMGNkNzRiXkEyXkFqcGc@._V1_.jpg",
        "MV5BNTA4MjU4YTQtZTRjZC00OWI0LTk1YmUtMDdhMWY1Y2FlZDQyXkEyXkFqcGc@._V1_.jpg",
        "MV5BNmIyMDcyNjQtM2IyZS00ZTVjLThkM2ItOWJkOTUwODBjNDNjXkEyXkFqcGc@._V1_.jpg",
        "MV5BOWM2MWNiZDctMTY4OS00NzVjLTg4NzQtMmVhMGNlODYzMzM0XkEyXkFqcGc@._V1_.jpg",
        "MV5BYTk2NjYxZWEtOGE4ZS00OTg4LWI4MTMtNDM3NzcyM2IyZDQ2XkEyXkFqcGc@._V1_.jpg",
        "MV5BYjI3MmU5MTctYWRmYi00ZDQ0LWEzMDktMTQxZmVjZWYzYmY1XkEyXkFqcGc@._V1_.jpg",
        "MV5BYmZlMDc2ZDctZWM3Yi00OTA3LWI3MmItYzM5YTc0N2JhZTYyXkEyXkFqcGc@._V1_.jpg",
        "MV5BZTgzMTZkMGQtN2JkZC00MTdmLWJiMzYtM2M2ZmQwZTA3ZGM2XkEyXkFqcGc@._V1_.jpg",
        "MV5BZjkxNzEyYzAtMDU5MS00MmZjLWE5OWYtNTA4YTQxZDYzMmJmXkEyXkFqcGc@._V1_.jpg",
        "MV5BZjkzMDMwODEtOTRhZi00ODU2LWIwYjItNzY5MmRhNjhhNDc0XkEyXkFqcGc@._V1_.jpg",
        "MV5BZmIwMDViYzgtMDA2ZS00ZWJlLWI4MWYtNDg2YjgzOTBmNjBhXkEyXkFqcGc@._V1_.jpg",
        "PAPELES.png",
        "UNA_NOCHE_CON_ADELA.jpg",
        "LA_ULTIMA.jpg",
        "VAST_OF_NIGHT.jpg",
        "ANNE_EVERLASTING.jpg"
    ];

    // --- Poster Carousel ---
    function initCarousel() {
        const track = document.getElementById('poster-track');
        if (!track) return;

        // Build poster elements (duplicate set for infinite scroll)
        const postersHTML = allPosters.map(file =>
            `<div class="poster-slide"><img src="img/projects/${encodeURIComponent(file)}" alt="Project poster" loading="lazy"></div>`
        ).join('');

        // Duplicate for seamless infinite scroll
        track.innerHTML = postersHTML + postersHTML;

        // Auto-scroll: each poster is 160px + 24px gap = 184px per poster
        const posterWidth = 184;
        const totalWidth = allPosters.length * posterWidth;
        let position = 0;

        function scrollCarousel() {
            position -= 1;
            if (Math.abs(position) >= totalWidth) {
                position = 0;
            }
            track.style.transform = `translateX(${position}px)`;
            requestAnimationFrame(scrollCarousel);
        }

        // Speed: traverse one poster width (220px) in 2500ms = ~0.088px per frame at 60fps
        // Using a smoother CSS animation approach instead
        const duration = allPosters.length * 2.5; // total seconds for one full set
        track.style.animation = `carouselScroll ${duration}s linear infinite`;

        // Set CSS custom property for the total width
        track.style.setProperty('--carousel-total-width', `${totalWidth}px`);
    }

    // --- i18n Logic ---
    function updateLanguage(lang) {
        currentLang = lang;
        document.body.setAttribute('data-lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[lang][key]) {
                el.innerHTML = i18n[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-hold]').forEach(el => {
            const key = el.getAttribute('data-i18n-hold');
            if (i18n[lang][key]) {
                el.placeholder = i18n[lang][key];
            }
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `lang-${lang}`);
        });

        renderGallery();
    }

    document.getElementById('lang-en').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('lang-es').addEventListener('click', () => updateLanguage('es'));

    // --- Featured Projects (only selected projects with synopsis/trailer) ---
    const featuredIds = ['papeles', 'la-boda', 'la-ultima', 'vast-of-night', 'la-espera', 'muxes', 'anne-everlasting', 'wandering-saint'];
    const galleryGrid = document.getElementById('gallery-grid');

    let dynamicProjects = [];

    async function loadProjects() {
        try {
            const res = await fetch('data/projects_index.json');
            dynamicProjects = await res.json();
            renderGallery();
        } catch (e) {
            console.error("Error loading projects for Decap CMS:", e);
        }
    }

    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        // Filter only projects that have the featured flag set to true (from the CMS)
        const featuredProjects = dynamicProjects.filter(p => p.featured);

        featuredProjects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card reveal';
            card.onclick = () => openProjectModal(project);

            const imgContent = project.image
                ? `<img src="${project.image}" alt="${project.title}" class="project-img" loading="lazy">`
                : `<div class="img-placeholder">${project.title}</div>`;

            // Adjust fallback for fields that were localized but might not be in the simple simple CMS setup
            const title = typeof project.title === 'string' ? project.title : (project.title[currentLang] || project.title.en);
            const category = typeof project.category === 'string' ? project.category : (project.category[currentLang] || project.category.en);

            card.innerHTML = `
                <div class="project-img-wrapper">
                    ${imgContent}
                </div>
                <div class="project-info">
                    <span class="project-category">${category}</span>
                    <h3 class="project-title">${title}</h3>
                    <p class="project-director">${project.director}</p>
                </div>
            `;
            galleryGrid.appendChild(card);
            revealObserver.observe(card);
        });
    }

    // --- Enhanced Modal Logic ---
    const modal = document.getElementById('videoModal');
    const iframeContainer = document.getElementById('iframeContainer');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDirector = document.getElementById('modal-director');
    const modalSynopsis = document.getElementById('modal-synopsis');
    const modalStills = document.getElementById('modal-stills-container');

    function openProjectModal(project) {
        // Handle both simple strings (from CMS) and objects with currentLang (legacy hardcoded)
        const getLocalized = (field) => typeof field === 'string' ? field : (field ? (field[currentLang] || field.en) : '');

        modalTitle.innerText = getLocalized(project.title);
        modalCategory.innerText = getLocalized(project.category);
        modalDirector.innerText = project.director || '';
        modalSynopsis.innerText = getLocalized(project.synopsis);

        if (project.video) {
            const iframe = document.createElement('iframe');
            iframe.src = `${project.video}?autoplay=1&rel=0`;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframeContainer.innerHTML = '';
            iframeContainer.appendChild(iframe);
        } else if (project.trailer) {
            // Fallback to old property name just in case
            const iframe = document.createElement('iframe');
            iframe.src = `${project.trailer}?autoplay=1&rel=0`;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframeContainer.innerHTML = '';
            iframeContainer.appendChild(iframe);
        } else {
            iframeContainer.innerHTML = '<div class="no-video" data-i18n="trailer_coming_soon">Trailer coming soon...</div>';
        }

        modalStills.innerHTML = '';
        if (project.stills && project.stills.length > 0) {
            project.stills.forEach(still => {
                const img = document.createElement('img');
                img.src = typeof still === 'string' ? still : (still.still || ''); // Handle CMS list structure
                img.alt = getLocalized(project.title);
                modalStills.appendChild(img);
            });
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        iframeContainer.innerHTML = '';
        document.body.style.overflow = '';
    }

    document.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // --- Generic Setup ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Initial render
    initCarousel();
    loadProjects(); // This replaces the synchronous renderGallery()
});

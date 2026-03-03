// Misterio Color Lab - Advanced Logic & i18n
document.addEventListener('DOMContentLoaded', () => {
    let currentLang = document.body.getAttribute('data-lang') || 'en';
    let cmsData = { homeData: null, studioData: null, teamData: null, contactData: null };

    // --- initialization sequence ---
    async function initApp() {
        if (window.CMS && window.CMS.loadSettings) {
            cmsData = await window.CMS.loadSettings();
        }

        updateLanguage(currentLang);
        loadProjects();
    }

    // --- Poster Carousel ---
    function initCarousel() {
        const track = document.getElementById('poster-track');
        if (!track) return;
        track.innerHTML = '';

        let posters = [];
        if (cmsData.homeData && cmsData.homeData.carousel) {
            posters = cmsData.homeData.carousel.map(item => typeof item === 'string' ? item : item.image);
        } else {
            // Fallback just in case
            posters = [
                "img/projects/BARRA_BRAVA.png",
                "img/projects/EL SANTO.png",
                "img/projects/HBO_MUXES.webp"
            ];
        }

        // Build poster elements (duplicate set for infinite scroll)
        const postersHTML = posters.map(img =>
            `<div class="poster-slide"><img src="${img}" alt="Project poster" loading="lazy"></div>`
        ).join('');

        // Duplicate for seamless infinite scroll
        track.innerHTML = postersHTML + postersHTML;

        // Auto-scroll: each poster is 160px + 24px gap = 184px per poster
        const posterWidth = 184;
        const totalWidth = posters.length * posterWidth;
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
        const duration = posters.length * 2.5; // total seconds for one full set
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
    loadProjects(); // This replaces the synchronous renderGallery()
});

document.addEventListener('DOMContentLoaded', () => {
    window.renderDynamicSettings = function () {
        if (!cmsData.homeData && !cmsData.studioData && !cmsData.teamData && !cmsData.contactData) return;

        // 1. Home - Hero
        if (cmsData.homeData && cmsData.homeData.hero) {
            const h1 = document.querySelector('.hero-content h1');
            const sub = document.getElementById('cms-hero_subtitle');

            if (h1) h1.innerHTML = window.CMS.getLocalizedText(cmsData.homeData.hero.title, currentLang);
            if (sub) sub.innerHTML = window.CMS.getLocalizedText(cmsData.homeData.hero.subtitle, currentLang);
        }

        // 2. Studio - About & Services
        if (cmsData.studioData && cmsData.studioData.about) {
            const p1 = document.getElementById('cms-studio_text_1');
            const p2 = document.getElementById('cms-studio_text_2');
            if (p1) p1.innerHTML = window.CMS.getLocalizedText(cmsData.studioData.about.paragraph_1, currentLang);
            if (p2) p2.innerHTML = window.CMS.getLocalizedText(cmsData.studioData.about.paragraph_2, currentLang);
        }

        if (cmsData.studioData && cmsData.studioData.services) {
            const servicesCont = document.getElementById('cms-services-list');
            if (servicesCont) {
                servicesCont.className = 'services-list';
                servicesCont.innerHTML = cmsData.studioData.services.map(s =>
                    `<div class="service-item">
                        <span class="service-icon">✦</span>
                        <span class="service-name">${window.CMS.getLocalizedText(s.name, currentLang)}</span>
                     </div>`
                ).join('');
            }
        }

        // 3. Team - Grid
        if (cmsData.teamData && cmsData.teamData.members) {
            const teamCont = document.getElementById('cms-team-list');
            if (teamCont) {
                teamCont.className = 'team-grid';
                teamCont.innerHTML = cmsData.teamData.members.map(m => `
                     <div class="team-member reveal active">
                        <div class="member-photo-wrapper">
                            ${m.photo ? `<img src="${m.photo}" alt="${m.name}" class="member-photo">` : '<div class="member-photo"></div>'}
                        </div>
                        <h3 class="member-name">${m.name}</h3>
                        <p class="member-role">${window.CMS.getLocalizedText(m.role, currentLang)}</p>
                        ${m.email ? `<a href="mailto:${m.email}" class="member-email">${m.email}</a>` : ''}
                     </div>
                 `).join('');
            }
        }

        // 4. Reload Carousel because data is now ready
        if (cmsData.homeData && cmsData.homeData.carousel) {
            const track = document.getElementById('poster-track');
            if (track) {
                track.innerHTML = '';
                let posters = cmsData.homeData.carousel.map(item => typeof item === 'string' ? item : item.image);

                const postersHTML = posters.map(img =>
                    `<div class="poster-slide"><img src="/${img}" alt="Project poster" loading="lazy"></div>`
                ).join('');

                track.innerHTML = postersHTML + postersHTML;

                const posterWidth = 184;
                const totalWidth = posters.length * posterWidth;
                const duration = posters.length * 2.5;
                track.style.animation = `carouselScroll ${duration}s linear infinite`;
                track.style.setProperty('--carousel-total-width', `${totalWidth}px`);
            }
        }

        // Ensure Scroll reveals execute on freshly rendered components.
        setTimeout(() => {
            const newReveals = document.querySelectorAll('.reveal:not(.active)');
            newReveals.forEach(r => r.classList.add('active'));
        }, 100);
    };
});

setTimeout(window.renderDynamicSettings, 300);

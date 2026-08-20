// Misterio Color Lab - Advanced Logic & i18n
document.addEventListener('DOMContentLoaded', () => {
    let currentLang = document.body.getAttribute('data-lang') || 'en';
    let cmsData = { homeData: null, studioData: null, teamData: null, contactData: null };
    let dynamicProjects = [];

    // --- initialization sequence ---
    async function initApp() {
        if (window.CMS && window.CMS.loadSettings) {
            cmsData = await window.CMS.loadSettings();
        }

        updateLanguage(currentLang);
        loadProjects();
        renderDynamicSettings();
        initIntlTel();

        // Handle URL hash on load (e.g. from /deck/#contact-form)
        if (window.location.hash) {
            setTimeout(() => {
                if (window.location.hash.startsWith('#video-')) {
                    const targetId = window.location.hash.replace('#video-', '');
                    const targetCard = document.querySelector(`[data-id="${targetId}"]`) || document.querySelector(`.project-card[data-project-id="${targetId}"]`);
                    if (targetCard) {
                        targetCard.click();
                    }
                } else {
                    const el = document.querySelector(window.location.hash);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 600);
        }
    }

    function initHeroVideo() {
        const video = document.getElementById('hero-video');
        if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) return;

        const loadVideo = () => {
            video.querySelectorAll('source[data-src]').forEach(source => {
                source.src = source.dataset.src;
                source.removeAttribute('data-src');
            });
            video.load();
            video.play().catch(() => {});
        };

        // Let the poster, typography and carousel thumbnails paint before the
        // background reel starts competing for bandwidth.
        window.setTimeout(loadVideo, 4500);
    }

    // --- i18n Logic ---
    function updateLanguage(lang) {
        currentLang = lang;
        document.body.setAttribute('data-lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
                el.innerHTML = window.i18n[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-hold]').forEach(el => {
            const key = el.getAttribute('data-i18n-hold');
            if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
                el.placeholder = window.i18n[lang][key];
            }
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `lang-${lang}`);
        });

        renderGallery();
        renderDynamicSettings();
    }

    window.updateLanguage = updateLanguage; // Export for buttons

    document.getElementById('lang-en')?.addEventListener('click', () => updateLanguage('en'));
    document.getElementById('lang-es')?.addEventListener('click', () => updateLanguage('es'));

    // --- Featured Projects ---
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryGridHome = document.getElementById('gallery-grid-home');

    function responsiveProjectImage(imagePath, width = 640) {
        if (!imagePath || /^https?:\/\//i.test(imagePath)) return imagePath;
        const filename = imagePath.split('/').pop();
        return `/img/projects/web/${filename}-${width}.webp`;
    }

    async function loadProjects() {
        try {
            const res = await fetch('/data/projects_index.json');
            dynamicProjects = await res.json();
            renderGallery();
        } catch (e) {
            console.error("Error loading projects:", e);
        }
    }

    function renderGallery() {
        if (!galleryGrid && !galleryGridHome) return;
        if (galleryGrid) galleryGrid.innerHTML = '';
        if (galleryGridHome) galleryGridHome.innerHTML = '';

        let featuredProjects = [];
        const orderList = cmsData.homeData?.featured_projects || [];

        if (orderList.length > 0) {
            // Map the titles to actual project objects in the specified order
            orderList.forEach(item => {
                const titleRef = typeof item === 'string' ? item : item.project;
                const project = dynamicProjects.find(p => {
                    const pTitle = typeof p.title === 'string' ? p.title : (p.title.en || p.title.es);
                    return pTitle.trim().toLowerCase() === titleRef.trim().toLowerCase();
                });
                if (project) featuredProjects.push(project);
            });

            // Add any other projects that are marked as featured but not in the order list
            const currentTitles = featuredProjects.map(p => typeof p.title === 'string' ? p.title : (p.title.en || p.title.es));
            dynamicProjects.filter(p => p.featured && !currentTitles.includes(typeof p.title === 'string' ? p.title : (p.title.en || p.title.es))).forEach(p => featuredProjects.push(p));
        } else {
            // Fallback to original logic if no order is defined in CMS
            featuredProjects = dynamicProjects.filter(p => p.featured);
        }

        const createCard = (project) => {
            const card = document.createElement('article');
            card.className = 'project-card reveal';

            const imgSrc = (project.image && project.image.startsWith('/')) ? project.image : '/' + project.image;
            const imgContent = project.image
                ? `<img src="${responsiveProjectImage(imgSrc, 640)}" srcset="${responsiveProjectImage(imgSrc, 320)} 320w, ${responsiveProjectImage(imgSrc, 640)} 640w, ${responsiveProjectImage(imgSrc, 960)} 960w" sizes="(max-width: 768px) 50vw, 25vw" alt="${typeof project.title === 'string' ? project.title : project.title.en} — Misterio Color Lab" class="project-img" width="640" height="960" loading="lazy" decoding="async">`
                : `<div class="img-placeholder">${typeof project.title === 'string' ? project.title : project.title.en}</div>`;

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
            // Store the project data on the element for delegated click
            card.dataset.projectId = project.id || title;
            card.dataset.id = (project.id || title).toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return card;
        };

        featuredProjects.forEach((project, index) => {
            if (galleryGrid) {
                const card = createCard(project);
                galleryGrid.appendChild(card);
                revealObserver.observe(card);
            }
            if (galleryGridHome && index < 4) {
                const cardHome = createCard(project);
                galleryGridHome.appendChild(cardHome);
                revealObserver.observe(cardHome);
            }
        });
    }

    // Use event delegation for clicking cards (fixes dynamically injected content losing events)
    const delegateClick = (gridId) => {
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.project-card');
                if (!card) return;

                const projectId = card.dataset.projectId;
                const project = dynamicProjects.find(p => (p.id || (typeof p.title === 'string' ? p.title : (p.title[currentLang] || p.title.en))) === projectId);

                if (project) {
                    if (!project.id) {
                        project.id = card.dataset.id;
                    }
                    openProjectModal(project);
                }
            });
        }
    };

    delegateClick('gallery-grid');
    delegateClick('gallery-grid-home');

    // --- Modal Logic ---
    function getEmbedUrl(url) {
        if (!url) return '';
        
        // Vimeo
        if (url.includes('vimeo.com')) {
            const parts = url.split('/');
            const vimeoId = parts[parts.length - 1].split('?')[0];
            return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
        }
        
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const youtubeId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop().split('?')[0];
            return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`;
        }
        
        // Instagram
        if (url.includes('instagram.com')) {
            const cleanUrl = url.split('?')[0].replace(/\/$/, "");
            return `${cleanUrl}/embed/`;
        }
        
        return url;
    }

    let modalOriginPath = window.location.pathname;

    function openProjectModal(project) {
        if (!project) return;
        console.log("Opening modal for project:", project);

        if (!window.location.pathname.startsWith('/project/') && !window.location.pathname.startsWith('/tvc/')) {
            modalOriginPath = window.location.pathname;
        }

        const modal = document.getElementById('videoModal');
        const iframeContainer = document.getElementById('iframeContainer');
        const modalTitle = document.getElementById('modal-title');
        const modalCategory = document.getElementById('modal-category');
        const modalDirector = document.getElementById('modal-director');
        const modalSynopsis = document.getElementById('modal-synopsis');
        const modalStills = document.getElementById('modal-stills-container');
        const modalAttribution = document.getElementById('modal-attribution');

        if (!modal) {
            console.error("Modal element #videoModal not found in the DOM!");
            return;
        }

        const getLocalized = (field) => {
            if (!field) return '';
            if (typeof field === 'string') return field;
            return field[currentLang] || field.en || '';
        };

        if (modalTitle) modalTitle.innerText = getLocalized(project.title);
        if (modalCategory) modalCategory.innerText = getLocalized(project.category);
        if (modalDirector) modalDirector.innerText = project.director || '';
        if (modalSynopsis) modalSynopsis.innerHTML = getLocalized(project.synopsis);

        if (modalAttribution) {
            if (project.digitalColor) {
                let colorLink = 'https://cocolors.com';
                if (project.digitalColor.includes('Fady Melek')) colorLink = 'https://fadymelek.com/';
                if (project.digitalColor.includes('Raúl Lavado')) colorLink = 'https://www.instagram.com/raullavado_colorist/';
                
                modalAttribution.innerHTML = `<span class="attribution-label">DIGITAL COLOR:</span> <a href="${colorLink}" target="_blank" class="attribution-link">${project.digitalColor}</a>`;
                modalAttribution.classList.add('active');
            } else {
                modalAttribution.innerHTML = '';
                modalAttribution.classList.remove('active');
            }
        }

        const videoUrl = project.video || project.trailer;
        if (videoUrl) {
            const embedUrl = getEmbedUrl(videoUrl);
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            if (iframeContainer) {
                iframeContainer.innerHTML = '';
                iframeContainer.appendChild(iframe);
            }
        } else if (iframeContainer) {
            iframeContainer.innerHTML = '<div class="no-video" data-i18n="trailer_coming_soon">Trailer coming soon...</div>';
        }

        if (modalStills) {
            modalStills.innerHTML = '';
            if (project.stills && project.stills.length > 0) {
                 project.stills.forEach(still => {
                    const img = document.createElement('img');
                    img.src = typeof still === 'string' ? still : (still.still || '');
                    img.alt = getLocalized(project.title);
                    modalStills.appendChild(img);
                });
            }
        }

        if (project.slug || project.id) {
            const itemSlug = project.slug || project.id;
            const isTvc = (project.category && typeof project.category === 'string' && (project.category.toLowerCase().includes('branded') || project.category.toLowerCase().includes('tvc'))) || (!project.director && !project.digitalColor && (!project.synopsis || typeof project.synopsis === 'string'));
            const targetPath = isTvc ? '/tvc/' + itemSlug + '/' : '/project/' + itemSlug + '/';
            if (window.location.pathname !== targetPath) {
                window.history.pushState(null, null, targetPath);
            }
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.openProjectModal = openProjectModal;
    window.closeModal = closeModal;


    function closeModal() {
        const modal = document.getElementById('videoModal');
        const iframeContainer = document.getElementById('iframeContainer');
        modal?.classList.remove('open');
        if (iframeContainer) iframeContainer.innerHTML = '';
        document.body.style.overflow = '';
        
        if (window.location.pathname.startsWith('/project/') || window.location.pathname.startsWith('/tvc/')) {
            let fallbackPath = modalOriginPath;
            if (!fallbackPath || fallbackPath.startsWith('/project/') || fallbackPath.startsWith('/tvc/')) {
                fallbackPath = window.location.pathname.startsWith('/tvc/') ? '/tvc/' : '/long-form/';
            }
            window.history.replaceState(null, null, fallbackPath);
        } else if (window.location.hash && window.location.hash.startsWith('#video-')) {
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
    }

    // Use event delegation for the close button and background click since modal might be dynamic
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('videoModal');
        if (!modal) return;

        if (e.target === modal || e.target.closest('.close-modal')) {
            closeModal();
        }
    });

    // --- Dynamic Settings Render ---
    function renderDynamicSettings() {
        if (!cmsData.homeData && !cmsData.studioData && !cmsData.teamData && !cmsData.contactData) return;

        // 1. Home - Hero
        if (cmsData.homeData && cmsData.homeData.hero) {
            const h1 = document.getElementById('cms-hero_title');
            const sub = document.getElementById('cms-hero_subtitle');
            if (h1) h1.innerHTML = window.CMS.getLocalizedText(cmsData.homeData.hero.title, currentLang);
            if (sub) sub.innerHTML = window.CMS.getLocalizedText(cmsData.homeData.hero.subtitle, currentLang);
        }

        // 2. Studio
        if (cmsData.studioData && cmsData.studioData.about) {
            const p1 = document.getElementById('cms-studio_text_1');
            const p2 = document.getElementById('cms-studio_text_2');
            if (p1) p1.innerHTML = window.CMS.getLocalizedText(cmsData.studioData.about.paragraph_1, currentLang);
            if (p2) p2.innerHTML = window.CMS.getLocalizedText(cmsData.studioData.about.paragraph_2, currentLang);
        }

        if (cmsData.studioData && cmsData.studioData.services) {
            const servicesCont = document.getElementById('cms-services-list');
            if (servicesCont) {
                servicesCont.innerHTML = cmsData.studioData.services.map(s =>
                    `<div class="service-item">
                        <span class="service-icon">✦</span>
                        <span class="service-name">${window.CMS.getLocalizedText(s.name, currentLang)}</span>
                     </div>`
                ).join('');
            }
        }

        // 3. Team
        if (cmsData.teamData && cmsData.teamData.members) {
            const rowTop = document.getElementById('cms-team-row-top');
            const rowBottom = document.getElementById('cms-team-row-bottom');

            if (rowTop && rowBottom) {
                const members = cmsData.teamData.members;
                const topMembers = members.filter(m => !m.email);
                const bottomMembers = members.filter(m => m.email);

                const renderMember = (m) => {
                     const photoSrc = (m.photo && m.photo.startsWith('/')) ? m.photo : '/' + m.photo;
                     return `
                     <div class="team-member reveal active">
                        <div class="member-photo-wrapper">
                            ${m.photo ? `<img src="${photoSrc}" alt="${m.name}" class="member-photo">` : '<div class="member-photo"></div>'}
                        </div>
                        <h3 class="member-name">${m.name}</h3>
                        <p class="member-role">${window.CMS.getLocalizedText(m.role, currentLang)}</p>
                        ${m.email ? `<a href="mailto:${m.email}" class="member-email">${m.email}</a>` : ''}
                     </div>
                 `};

                rowTop.innerHTML = topMembers.map(renderMember).join('');
                rowBottom.innerHTML = bottomMembers.map(renderMember).join('');
            }
        }

        // Trigger Reveal Observer check
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('active');
                }
                revealObserver.observe(el);
            });
        }, 100);
    }

    window.renderDynamicSettings = renderDynamicSettings;

    // --- Generic Setup ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger?.addEventListener('click', () => {
        navLinks?.classList.toggle('active');
        hamburger?.classList.toggle('active');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Start everything
    initHeroVideo();
    initApp();

    // Initialize International Phone Input
    function initIntlTel() {
        const phoneInput = document.querySelector("#phone");
        if (phoneInput && window.intlTelInput) {
            window.intlTelInput(phoneInput, {
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@21.2.7/build/js/utils.js",
                initialCountry: "auto",
                geoIpLookup: function(success, failure) {
                    fetch("https://ipapi.co/json")
                        .then(res => res.json())
                        .then(data => success(data.country_code))
                        .catch(() => success("es"));
                },
                separateDialCode: true,
                preferredCountries: ["es", "no", "mx", "br", "us"]
            });
        }
    }
});

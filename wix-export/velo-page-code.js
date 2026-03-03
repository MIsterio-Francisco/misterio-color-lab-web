// =====================================================
// MISTERIO COLOR LAB — Velo Code for Wix
// =====================================================
// Pega este código en el editor Velo de tu página principal.
// Requiere: Colección "Projects" en Wix CMS con los campos del CSV.
// Elementos Wix necesarios (IDs): ver comentarios en cada sección.

import wixData from 'wix-data';
import wixWindow from 'wix-window';

// --- Estado global ---
let currentLang = 'en';

// --- Textos i18n ---
const i18n = {
    en: {
        hero_subtitle: "Specialists in color grading and finishing for films, documentaries, and commercials worldwide.",
        section_work: "Featured Projects",
        section_studio: "The Studio",
        studio_text_1: "Misterio Color Lab is a post-production boutique specializing in color grading and finishing. We believe in the power of color to tell stories, conveying the exact emotion in every frame.",
        studio_text_2: "Our approach combines cutting-edge technology with a unique artistic vision, working closely with directors and cinematographers to achieve their ultimate vision.",
        service_1: "Color Grading & HDR",
        service_2: "Conforming & Mastering",
        service_3: "On-Set Supervision",
        contact_title: "Contact Us",
        contact_subtitle: "Have a project in mind? Let's talk about how we can give it the final touch it deserves.",
        footer_desc: "Crafting the visual soul of your story."
    },
    es: {
        hero_subtitle: "Especialistas en la corrección de color y finalización para películas, documentales y comerciales a nivel mundial.",
        section_work: "Proyectos Destacados",
        section_studio: "El Estudio",
        studio_text_1: "Misterio Color Lab es una boutique de post-producción especializada en etalonaje y finalización. Creemos en el poder del color para contar historias, transmitiendo la emoción exacta en cada fotograma.",
        studio_text_2: "Nuestro enfoque combina tecnología de vanguardia con una visión artística única, colaborando estrechamente con directores y directores de fotografía para alcanzar su máxima visión.",
        service_1: "Gradación de Color y HDR",
        service_2: "Conformado y Mastering",
        service_3: "Supervisión en Set",
        contact_title: "Contáctanos",
        contact_subtitle: "¿Tienes un proyecto en mente? Hablemos sobre cómo podemos darle el acabado final que merece.",
        footer_desc: "Creando el alma visual de tu historia."
    }
};

// =====================================================
// INIT
// =====================================================
$w.onReady(function () {
    // Configurar botones de idioma
    // Necesitas dos botones en tu editor con IDs: #btnEN y #btnES
    $w('#btnEN').onClick(() => switchLang('en'));
    $w('#btnES').onClick(() => switchLang('es'));

    // Carga inicial
    updateTexts();
    loadProjects();
});

// =====================================================
// IDIOMAS (i18n)
// =====================================================
function switchLang(lang) {
    currentLang = lang;

    // Estilo de botones activos
    $w('#btnEN').style.color = lang === 'en' ? '#ff4500' : '#9ba0a6';
    $w('#btnES').style.color = lang === 'es' ? '#ff4500' : '#9ba0a6';

    updateTexts();
    loadProjects(); // Recargar con el nuevo idioma
}

function updateTexts() {
    const t = i18n[currentLang];

    // Mapear IDs de elementos Wix → claves i18n
    // Adapta estos IDs a los que uses en tu editor
    const mapping = {
        '#heroSubtitle': 'hero_subtitle',
        '#sectionWorkTitle': 'section_work',
        '#sectionStudioTitle': 'section_studio',
        '#studioText1': 'studio_text_1',
        '#studioText2': 'studio_text_2',
        '#service1': 'service_1',
        '#service2': 'service_2',
        '#service3': 'service_3',
        '#contactTitle': 'contact_title',
        '#contactSubtitle': 'contact_subtitle',
        '#footerDesc': 'footer_desc'
    };

    for (const [elementId, key] of Object.entries(mapping)) {
        try {
            $w(elementId).text = t[key];
        } catch (e) {
            // Elemento no encontrado en esta página, ignorar
        }
    }
}

// =====================================================
// GALERÍA DE PROYECTOS
// =====================================================
// Necesitas un Repeater en tu editor con ID: #projectRepeater
// Dentro del repeater: #projectImage, #projectCategory, #projectTitle, #projectDirector

async function loadProjects() {
    try {
        const results = await wixData.query("Projects")
            .eq("featured", true)
            .ascending("order")
            .find();

        const items = results.items.map(item => ({
            _id: item._id,
            title: currentLang === 'en' ? item.title_en : item.title_es,
            category: currentLang === 'en' ? item.category_en : item.category_es,
            director: item.director,
            image: item.image,
            synopsis: currentLang === 'en' ? item.synopsis_en : item.synopsis_es,
            trailer_url: item.trailer_url
        }));

        $w('#projectRepeater').data = items;

        $w('#projectRepeater').onItemReady(($item, itemData) => {
            $item('#projectImage').src = itemData.image;
            $item('#projectCategory').text = itemData.category;
            $item('#projectTitle').text = itemData.title;
            $item('#projectDirector').text = itemData.director;

            // Clic → abrir lightbox con detalles del proyecto
            $item('#projectCard').onClick(() => {
                wixWindow.openLightbox("ProjectModal", {
                    title: itemData.title,
                    category: itemData.category,
                    director: itemData.director,
                    synopsis: itemData.synopsis,
                    trailer: itemData.trailer_url,
                    image: itemData.image
                });
            });
        });
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// =====================================================
// LIGHTBOX (ProjectModal) — Pegar en el código del Lightbox
// =====================================================
// Crea un Lightbox llamado "ProjectModal" con estos elementos:
// #modalTitle, #modalCategory, #modalDirector, #modalSynopsis, #modalVideo (HTML embed)

/*
  --- PEGAR ESTE CÓDIGO EN EL LIGHTBOX "ProjectModal" ---

import wixWindow from 'wix-window';

$w.onReady(function () {
    const data = wixWindow.lightbox.getContext();

    $w('#modalTitle').text = data.title;
    $w('#modalCategory').text = data.category;
    $w('#modalDirector').text = data.director;
    $w('#modalSynopsis').text = data.synopsis;

    // Embed del trailer en un HTML Component
    if (data.trailer) {
        $w('#modalVideo').src = data.trailer;
        // O si usas un HTML embed:
        // $w('#modalVideoEmbed').postMessage(data.trailer);
    }
});

*/

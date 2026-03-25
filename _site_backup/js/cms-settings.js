// cms-settings.js - Handles loading global configurations from Decap CMS

async function loadCMSSettings() {
    try {
        const responses = await Promise.allSettled([
            fetch('/data/settings/home.json').then(res => res.json()),
            fetch('/data/settings/studio.json').then(res => res.json()),
            fetch('/data/settings/team.json').then(res => res.json()),
            fetch('/data/settings/contact.json').then(res => res.json()),
        ]);

        const homeData = responses[0].status === 'fulfilled' ? responses[0].value : null;
        const studioData = responses[1].status === 'fulfilled' ? responses[1].value : null;
        const teamData = responses[2].status === 'fulfilled' ? responses[2].value : null;
        const contactData = responses[3].status === 'fulfilled' ? responses[3].value : null;

        return { homeData, studioData, teamData, contactData };
    } catch (err) {
        console.warn("CMS settings fetch failed:", err);
        return { homeData: null, studioData: null, teamData: null, contactData: null };
    }
}

// Function to safely get localized text
function getLocalizedText(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.en || '';
}

window.CMS = {
    loadSettings: loadCMSSettings,
    getLocalizedText: getLocalizedText
};

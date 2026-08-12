const tvcData = require('./tvc.json');

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

module.exports = function() {
    const usedSlugs = new Set();

    return tvcData.videos.map(video => {
        let baseSlug = slugify(video.title);
        let finalSlug = baseSlug;

        if (usedSlugs.has(finalSlug)) {
            let counter = 2;
            while (usedSlugs.has(`${finalSlug}-${counter}`)) {
                counter++;
            }
            finalSlug = `${finalSlug}-${counter}`;
        }
        usedSlugs.add(finalSlug);

        const youtube_id = video.youtube_id || (video.video_url && video.video_url.includes('v=') ? video.video_url.split('v=')[1].split('&')[0] : '');
        const image = video.image || (youtube_id ? `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg` : '/img/logo_white_hq.png');
        const video_url = video.video_url || (youtube_id ? `https://www.youtube.com/watch?v=${youtube_id}` : '');
        
        const cleanSynopsis = video.credits_html 
            ? video.credits_html.replace(/<br\s*\/?>/gi, ' — ').replace(/<[^>]+>/g, '')
            : `Commercial and branded content color grading for ${video.title} by Misterio Color Lab.`;

        return {
            ...video,
            slug: finalSlug,
            id: finalSlug,
            youtube_id,
            image,
            video_url,
            cleanSynopsis
        };
    });
};

const fs = require('fs');
const path = require('path');

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
    const projectsDir = path.join(__dirname, '../data/collections/projects');
    if (!fs.existsSync(projectsDir)) return [];
    
    const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.json'));
    const usedSlugs = new Set();

    return files
        .map(file => {
            try {
                const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
                const project = JSON.parse(content);
                const fileSlug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.json$/, '');
                const titleStr = typeof project.title === 'string' ? project.title : (project.title.en || project.title.es || '');
                
                let baseSlug = project.slug || fileSlug || slugify(titleStr);
                let finalSlug = baseSlug;

                if (usedSlugs.has(finalSlug)) {
                    finalSlug = fileSlug;
                }
                if (usedSlugs.has(finalSlug)) {
                    let counter = 2;
                    while (usedSlugs.has(`${finalSlug}-${counter}`)) {
                        counter++;
                    }
                    finalSlug = `${finalSlug}-${counter}`;
                }

                usedSlugs.add(finalSlug);
                project.slug = finalSlug;
                project.id = finalSlug;
                return project;
            } catch (e) {
                console.error(`Error parsing project file ${file}:`, e);
                return null;
            }
        })
        .filter(p => p !== null);
};

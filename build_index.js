const fs = require('fs');

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

const files = fs.readdirSync('src/data/collections/projects').filter(f => f.endsWith('.json'));
const projects = [];
const usedSlugs = new Set();

files.forEach(f => {
    try {
        const project = JSON.parse(fs.readFileSync('src/data/collections/projects/' + f, 'utf8'));
        const fileSlug = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.json$/, '');
        const titleStr = typeof project.title === 'string' ? project.title : (project.title.en || project.title.es || '');
        
        let finalSlug = project.slug || fileSlug || slugify(titleStr);
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
        projects.push(project);
    } catch (e) {
        console.error(`Error parsing ${f}:`, e);
    }
});

fs.writeFileSync('src/data/projects_index.json', JSON.stringify(projects, null, 2));

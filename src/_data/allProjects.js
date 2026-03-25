const fs = require('fs');
const path = require('path');

module.exports = function() {
    const projectsDir = path.join(__dirname, '../data/collections/projects');
    if (!fs.existsSync(projectsDir)) return [];
    
    const files = fs.readdirSync(projectsDir);
    return files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            try {
                const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
                return JSON.parse(content);
            } catch (e) {
                console.error(`Error parsing project file ${file}:`, e);
                return null;
            }
        })
        .filter(p => p !== null);
};

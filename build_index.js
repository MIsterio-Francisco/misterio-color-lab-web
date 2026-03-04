const fs = require('fs');
const files = fs.readdirSync('src/data/collections/projects');
const projects = [];
files.forEach(f => {
    if (f.endsWith('.json')) {
        projects.push(JSON.parse(fs.readFileSync('src/data/collections/projects/' + f)));
    }
});
fs.writeFileSync('src/data/projects_index.json', JSON.stringify(projects));

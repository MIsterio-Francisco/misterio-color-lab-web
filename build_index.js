const fs = require('fs');
const files = fs.readdirSync('data/collections/projects');
const projects = [];
files.forEach(f => {
    if (f.endsWith('.json')) {
        projects.push(JSON.parse(fs.readFileSync('data/collections/projects/' + f)));
    }
});
fs.writeFileSync('data/projects_index.json', JSON.stringify(projects));

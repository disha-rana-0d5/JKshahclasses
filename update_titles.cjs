const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace " | JK Shah Classes" with ""
    content = content.replace(/ \| JK Shah Classes"/g, '"');
    
    // Replace ' | JK Shah Classes' with ''
    content = content.replace(/ \| JK Shah Classes'/g, "'");
    
    // Replace ` | JK Shah Classes` with `
    content = content.replace(/ \| JK Shah Classes`/g, "`");
    
    // Sometimes it's without space before |
    content = content.replace(/\| JK Shah Classes"/g, '"');
    content = content.replace(/\| JK Shah Classes'/g, "'");
    content = content.replace(/\| JK Shah Classes`/g, "`");
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${changedCount} files.`);

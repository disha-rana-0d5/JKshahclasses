const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Mock content
const content = "<h1>Mock Content</h1><p>This should be hidden.</p>";
const loaderHTML = `<div id="initial-loader">Loading...</div>`;

const injectBody = (html, content) => {
    console.log("Original HTML length:", html.length);
    const target = '<div id="root"></div>';
    if (html.includes(target)) {
        console.log("Target found exactly!");
    } else {
        console.log("Target NOT found exactly.");
        // Check for common variations
        if (html.includes('  <div id="root"></div>')) console.log("Target found with 2 spaces.");
        if (html.includes('<div id="root"></div>\n')) console.log("Target found with newline.");
    }

    return html.replace('<div id="root"></div>', `<div id="root">\n${loaderHTML}\n<div style="display:none" aria-hidden="true">\n${content}\n</div>\n</div>`);
};

if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    const result = injectBody(html, content);

    if (result.includes('style="display:none"')) {
        console.log("Injection SUCCESSFUL!");
        // console.log("Result sample:", result.substring(result.indexOf('<div id="root">'), result.indexOf('</div>\n</div>') + 13));
    } else {
        console.log("Injection FAILED.");
    }
} else {
    console.log("dist/index.html not found at", indexPath);
}

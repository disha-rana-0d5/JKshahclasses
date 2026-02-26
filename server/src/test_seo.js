const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // This depends on where you run it. In src/ it should be ../.env
// But if run from server root, it should be .env
// server/.env exists. src/server.js uses dotenv.config() which looks in current cmd dir.
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Blog = require('./models/Blog');
const Course = require('./models/Course');
const Category = require('./models/Category');

// Helper to inject meta tags into HTML
const injectMeta = (html, { title, description, keywords }) => {
    let res = html;
    if (title) res = res.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    if (description) {
        if (res.includes('name="description"')) {
            res = res.replace(/<meta name="description" content=".*?" \/?>/, `<meta name="description" content="${description}" />`);
        } else {
            res = res.replace('</head>', `<meta name="description" content="${description}" />\n</head>`);
        }
    }
    if (keywords) {
        if (res.includes('name="keywords"')) {
            res = res.replace(/<meta name="keywords" content=".*?" \/?>/, `<meta name="keywords" content="${keywords}" />`);
        } else {
            res = res.replace('</head>', `<meta name="keywords" content="${keywords}" />\n</head>`);
        }
    }
    return res;
};

const distPath = path.resolve(__dirname, '../../dist');
const indexPath = path.join(distPath, 'index.html');

async function testInjection(slug) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Testing slug:', slug);
    const titlePattern = slug.replace(/-/g, ' ');
    const course = await Course.findOne({
        title: { $regex: new RegExp(`^${titlePattern}$`, 'i') }
    });

    if (!course) {
        console.log('Course not found');
        return;
    }

    console.log('Course found:', course.title, 'subCategory:', course.subCategory);
    const category = await Category.findOne({ name: course.subCategory });

    let html = fs.readFileSync(indexPath, 'utf8');

    const injected = injectMeta(html, {
        title: (category && category.metaTitle) || `${course.title} | JK Shah Classes`,
        description: (category && category.metaDescription) || (course.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
        keywords: (category && category.metaKeywords) || ""
    });

    console.log('--- INJECTED HTML (Snippet) ---');
    console.log(injected.substring(0, 500));
    console.log('-------------------------------');

    process.exit();
}

testInjection('chartered-accountant');

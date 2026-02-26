const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('./models/Course');
const Category = require('./models/Category');

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

async function testInjection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Create a test course with meta tags
        const testCourse = new Course({
            title: 'Test SEO Course',
            description: 'Test Description',
            category: 'CA Final',
            subCategory: 'Financial Reporting',
            level: 'Final',
            price: 1000,
            facultyName: 'Test Faculty',
            metaTitle: 'Custom SEO Title',
            metaDescription: 'Custom SEO Description',
            metaKeywords: 'test, keywords'
        });

        // Test the injection logic as implemented in server.js
        console.log('Testing injection for:', testCourse.title);

        const category = await Category.findOne({ name: testCourse.subCategory });

        const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '<html><head><title>Default</title></head><body></body></html>';

        const injected = injectMeta(html, {
            title: testCourse.metaTitle || (category && category.metaTitle) || `${testCourse.title} | JK Shah Classes`,
            description: testCourse.metaDescription || (category && category.metaDescription) || (testCourse.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
            keywords: testCourse.metaKeywords || (category && category.metaKeywords) || ""
        });

        console.log('--- RESULTS ---');
        console.log('Title Match:', injected.includes('<title>Custom SEO Title</title>'));
        console.log('Description Match:', injected.includes('content="Custom SEO Description"'));
        console.log('Keywords Match:', injected.includes('content="test, keywords"'));
        console.log('----------------');

        if (injected.includes('<title>Custom SEO Title</title>') &&
            injected.includes('content="Custom SEO Description"') &&
            injected.includes('content="test, keywords"')) {
            console.log('SUCCESS: SEO Meta injection works correctly!');
        } else {
            console.log('FAILURE: Injection logic produced unexpected result.');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testInjection();

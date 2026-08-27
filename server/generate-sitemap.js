const mongoose = require('mongoose');
const fs = require('fs');

const uri = "mongodb://admin:Silicon%402011%21@161.97.182.90:27017/jkshah?authSource=admin";

function generateSlug(text) {
    if (!text) return '';
    return text.toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
}

const CourseSchema = new mongoose.Schema({
  title: String,
  status: String,
  updatedAt: Date
}, { collection: 'courses' });

const Course = mongoose.model('Course', CourseSchema);

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  updatedAt: Date
}, { collection: 'categories' });

const Category = mongoose.model('Category', CategorySchema);

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    
    // Get all active courses
    const courseList = await Course.find({ status: "Active" }).lean();
    
    // Get all categories
    const categoryList = await Category.find({}).lean();
    
    const frontendUrl = "https://jkshahclasses.com"; // Updated to non-www
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add base URLs
    const baseUrls = [
        '/',
        '/courses',
        '/branches',
        '/about/history',
        '/about/csr',
        '/ourachievers',
        '/alumni',
        '/faculty',
        '/placements',
        '/careers',
        '/blog',
        '/live-sessions',
        '/privacy',
        '/terms',
        '/refund-policy',
        '/resources',
        '/resources/timetables',
        '/resources/books',
        '/resources/test-series',
        '/resources/announcements'
    ];
    
    for (const url of baseUrls) {
        xml += `  <url>\n`;
        xml += `    <loc>${frontendUrl}${url}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;
    }
    
    // Add course URLs
    for (const course of courseList) {
        const slug = generateSlug(course.title);
        xml += `  <url>\n`;
        xml += `    <loc>${frontendUrl}/course/${slug}</loc>\n`;
        const date = course.updatedAt ? new Date(course.updatedAt).toISOString() : new Date().toISOString();
        xml += `    <lastmod>${date}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
    }
    
    // Add category URLs
    for (const cat of categoryList) {
        const cslug = cat.slug || generateSlug(cat.name);
        xml += `  <url>\n`;
        xml += `    <loc>${frontendUrl}/courses/${cslug}</loc>\n`;
        const date = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString();
        xml += `    <lastmod>${date}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
    }
    
    xml += `</urlset>`;
    
    fs.writeFileSync('../public/sitemap.xml', xml);
    // Also copy to dist if it exists
    if (fs.existsSync('../dist')) {
        fs.writeFileSync('../dist/sitemap.xml', xml);
    }
    
    console.log(`Generated sitemap.xml with ${courseList.length} courses and ${categoryList.length} categories.`);
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}

run();

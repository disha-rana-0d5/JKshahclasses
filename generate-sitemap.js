import fs from 'fs';

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

async function run() {
  try {
    const response = await fetch("http://161.97.182.90/api/courses");
    const json = await response.json();
    
    // Get all active courses
    const courseList = json.data.filter(c => c.status === "Active");
    
    // Get all categories
    const catResponse = await fetch("http://161.97.182.90/api/categories");
    const catJson = await catResponse.json();
    const categoryList = catJson.data || [];
    
    const frontendUrl = "http://161.97.182.90"; // From .env
    
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
    
    fs.writeFileSync('./public/sitemap.xml', xml);
    // Also copy to dist if it exists
    if (fs.existsSync('./dist')) {
        fs.writeFileSync('./dist/sitemap.xml', xml);
    }
    
    console.log(`Generated sitemap.xml with ${courseList.length} courses and ${categoryList.length} categories.`);
  } catch(e) {
    console.error(e);
  }
}
run();

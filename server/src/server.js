const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const levelRoutes = require('./routes/levelRoutes');
const contentRoutes = require('./routes/landingPageRoutes');
const batchRoutes = require('./routes/batchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const rankHolderRoutes = require('./routes/rankHolderRoutes');
const courseTimelineRoutes = require('./routes/courseTimelineRoutes');
const careerOpportunityRoutes = require('./routes/careerOpportunityRoutes');
const orderRoutes = require('./routes/orderRoutes');
const placementRoutes = require('./routes/placementRoutes');
const blogRoutes = require('./routes/blogRoutes');
const careerRoutes = require('./routes/careerRoutes');
const branchEnquiryRoutes = require('./routes/branchEnquiryRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const alumniWorkAtRoutes = require('./routes/alumniWorkAtRoutes');
const productRoutes = require('./routes/productRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const erpCourseMappingRoutes = require('./routes/erpCourseMappingRoutes');
const erpBatchVisibilityRoutes = require('./routes/erpBatchVisibilityRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const paymentEnquiryRoutes = require('./routes/paymentEnquiryRoutes');
const path = require('path');
const fs = require('fs');
const Blog = require('./models/Blog');
const Course = require('./models/Course');
const Category = require('./models/Category');
const Faculty = require('./models/Faculty');
const LandingPageContent = require('./models/LandingPageContent');
const Batch = require('./models/Batch');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Redirect www to non-www
app.use((req, res, next) => {
    if (req.headers.host && req.headers.host.startsWith('www.')) {
        const newHost = req.headers.host.replace(/^www\./, '');
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        return res.redirect(301, protocol + '://' + newHost + req.originalUrl);
    }
    next();
});

// 301 Redirects for SEO
const seoRedirects = {
    // CA
    '/course/ca-online-classes-foundation-to-final-all-in-one-place': '/course/chartered-accountant',
    '/course/chartered-accountant-ca': '/course/chartered-accountant',
    // ACCA
    '/course/acca-course-fees-duration-career-path-explained': '/course/acca-full-course',
    '/course/association-of-chartered-certified-accountants-acca': '/course/acca-full-course',
    // CFA
    '/course/cfa-course-build-your-career-in-investment-banking-finance': '/course/chartered-financial-analyst-cfa',
    // US CPA
    '/course/us-cpa-course-your-path-to-a-global-accounting-career': '/course/certified-public-accountant-us-cpa',
    // CMA USA
    '/course/cma-usa-course-fees-salary-career-growth-in-india': '/course/certified-management-accountant-cma-usa',
    
    // Duplicates from previous tasks
    '/course/company-secretary-cs': '/course/company-secretary',
    
    // HTTP Redirects from sheet
    '/our-director.php': '/about/history',
    '/chartered-accountancy.php': '/course/chartered-accountant',
    '/company-secretary.php': '/course/company-secretary',
    '/fyjc-syjc.php': '/course/11th-12th-commerce',
    '/acca_new.php': '/course/acca-full-course',
    '/announcement/IndianContractAct1872.pdf': '/resources/announcements',
    '/franchise/images/pdf/JKSCFB.pdf': '/careers',
    '/courses/cma-usa': '/course/certified-management-accountant-cma-usa',
    '/course/cma-india': '/course/cost-and-management-accountant-cma-india',
    '/courses/category/6970686ce0787cd6beb58b0e': '/',
    '/courses/category/6970686ce0787cd6beb58b0f': '/',
    '/courses/category/69b14893fc885049b61de463': '/'
};

const getCanonicalCourseUrl = (slug) => {
    const rawUrl = `/course/${slug}`;
    return seoRedirects[rawUrl] || rawUrl;
};

app.use((req, res, next) => {
    // Only redirect if path exactly matches (ignoring trailing slash is handled by express, but we check req.path)
    // Strip trailing slash for matching unless it's just '/'
    let path = req.path;
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    
    const redirectUrl = seoRedirects[path];
    if (redirectUrl) {
        const queryString = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
        return res.redirect(301, redirectUrl + queryString);
    }
    next();
});

// Helper to inject meta tags into HTML
const injectMeta = (html, { title, description, keywords, url, image, type }) => {
    let res = html;
    if (title) {
        res = res.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        if (!res.includes('property="og:title"')) {
            res = res.replace('</head>', `<meta property="og:title" content="${title}" />\n</head>`);
        } else {
            res = res.replace(/<meta property="og:title" content=".*?" \/?>/, `<meta property="og:title" content="${title}" />`);
        }
    }

    if (description) {
        if (res.includes('name="description"')) {
            res = res.replace(/<meta name="description" content=".*?" \/?>/, `<meta name="description" content="${description}" />`);
        } else {
            res = res.replace('</head>', `<meta name="description" content="${description}" />\n</head>`);
        }
        if (!res.includes('property="og:description"')) {
            res = res.replace('</head>', `<meta property="og:description" content="${description}" />\n</head>`);
        } else {
            res = res.replace(/<meta property="og:description" content=".*?" \/?>/, `<meta property="og:description" content="${description}" />`);
        }
    }

    if (keywords) {
        if (res.includes('name="keywords"')) {
            res = res.replace(/<meta name="keywords" content=".*?" \/?>/, `<meta name="keywords" content="${keywords}" />`);
        } else {
            res = res.replace('</head>', `<meta name="keywords" content="${keywords}" />\n</head>`);
        }
    }

    if (url) {
        if (!res.includes('property="og:url"')) {
            res = res.replace('</head>', `<meta property="og:url" content="${url}" />\n</head>`);
        } else {
            res = res.replace(/<meta property="og:url" content=".*?" \/?>/, `<meta property="og:url" content="${url}" />`);
        }
        if (!res.includes('rel="canonical"')) {
            res = res.replace('</head>', `<link rel="canonical" href="${url}" />\n</head>`);
        } else {
            res = res.replace(/<link rel="canonical" href=".*?" \/?>/, `<link rel="canonical" href="${url}" />`);
        }
    }

    if (image) {
        if (!res.includes('property="og:image"')) {
            res = res.replace('</head>', `<meta property="og:image" content="${image}" />\n</head>`);
        } else {
            res = res.replace(/<meta property="og:image" content=".*?" \/?>/, `<meta property="og:image" content="${image}" />`);
        }
    }

    if (type) {
        if (!res.includes('property="og:type"')) {
            res = res.replace('</head>', `<meta property="og:type" content="${type}" />\n</head>`);
        } else {
            res = res.replace(/<meta property="og:type" content=".*?" \/?>/, `<meta property="og:type" content="${type}" />`);
        }
    }

    return res;
};

// Helper to inject body content into #root
const injectBody = (html, content) => {
    // Add a server-side loader that shows while the JS bundle is downloading.
    // This loader will be replaced by the React app once it hydrates.
    const loaderHTML = `
        <div id="initial-loader" style="position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; z-index: 10000; font-family: system-ui, -apple-system, sans-serif;">
            <div style="width: 48px; height: 48px; border: 4px solid #f3f3f3; border-bottom-color: #373081; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite;"></div>
            <p style="margin-top: 16px; color: #373081; font-weight: 500; letter-spacing: 0.5px;">Loading...</p>
            <style>
                @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </div>
    `;

    // Wrap the SEO content in a hidden div so crawlers see it but users don't see raw text.
    return html.replace('<div id="root"></div>', `<div id="root">\n${loaderHTML}\n<div style="display:none" aria-hidden="true">\n${content}\n</div>\n</div>`);
};

// Content generation helpers for Pseudo-SSR
const generateCourseHTML = (course) => {
    if (!course) return '';
    return `
        <article>
            <h1>${course.title}</h1>
            
            <section class="meta-info">
                <p><strong>Category:</strong> ${course.category} > ${course.subCategory}</p>
                <p><strong>Level:</strong> ${course.level}</p>
                <p><strong>Duration:</strong> ${course.duration}</p>
                <p><strong>Lessons:</strong> ${course.lessons}</p>
                <p><strong>Rating:</strong> ${course.rating} (${course.reviews} reviews)</p>
                <p><strong>Price:</strong> ₹${course.price} ${course.originalPrice ? `<del>₹${course.originalPrice}</del>` : ''}</p>
                <p><strong>Batch:</strong> ${course.batchInfo}</p>
            </section>

            <div class="description">${course.description || ''}</div>
            
            ${course.overview ? `<section class="overview"><h2>Overview</h2>${course.overview}</section>` : ''}
            
            ${course.courseFeatures && course.courseFeatures.length > 0 ? `
                <section class="features">
                    <h2>Course Features</h2>
                    <ul>${course.courseFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
                </section>
            ` : ''}

            ${course.whatYouLearn && course.whatYouLearn.length > 0 ? `
                <section class="learning-outcomes">
                    <h2>What You Will Learn</h2>
                    <ul>${course.whatYouLearn.map(l => `<li>${l}</li>`).join('')}</ul>
                </section>
            ` : ''}

            ${course.whoShouldEnroll && course.whoShouldEnroll.length > 0 ? `
                <section class="target-audience">
                    <h2>Who Should Enroll</h2>
                    <ul>${course.whoShouldEnroll.map(a => `<li>${a}</li>`).join('')}</ul>
                </section>
            ` : ''}

            ${course.highlights && course.highlights.length > 0 ? `
                <section class="highlights">
                    <h2>Course Highlights</h2>
                    <ul>${course.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
                </section>
            ` : ''}
            
            ${course.syllabusModules && course.syllabusModules.length > 0 ? `
                <section class="syllabus">
                    <h2>Syllabus</h2>
                    ${course.syllabusModules.map(m => `
                        <div class="module">
                            <h3>${m.title} ${m.duration ? `(${m.duration})` : ''}</h3>
                            ${m.topics && m.topics.length > 0 ? `
                                <ul>
                                    ${m.topics.map(t => `
                                        <li>
                                            <strong>${t.title}</strong>
                                            ${t.details ? `<div class="topic-details">${t.details}</div>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}

            <section class="faculty">
                <h2>Instructor: ${course.facultyName}</h2>
                ${course.facultyDesignation ? `<p><strong>${course.facultyDesignation}</strong></p>` : ''}
                ${course.facultyBio ? `<div class="faculty-bio">${course.facultyBio}</div>` : ''}
                <ul>
                    ${course.facultyExperience ? `<li><strong>Experience:</strong> ${course.facultyExperience}</li>` : ''}
                    ${course.facultyStudents ? `<li><strong>Students Taught:</strong> ${course.facultyStudents}</li>` : ''}
                    ${course.facultySpecialization ? `<li><strong>Specialization:</strong> ${course.facultySpecialization}</li>` : ''}
                    ${course.facultyRating ? `<li><strong>Instructor Rating:</strong> ${course.facultyRating}/5</li>` : ''}
                </ul>
            </section>

            ${course.faqs && course.faqs.length > 0 ? `
                <section class="faqs">
                    <h2>Frequently Asked Questions</h2>
                    ${course.faqs.map(cat => `
                        <div class="faq-category">
                            <h3>${cat.category}</h3>
                            ${cat.topics.map(topic => `
                                <div class="faq-topic">
                                    <h4>${topic.title}</h4>
                                    ${topic.questions.map(q => `
                                        <div class="faq-item">
                                            <p><strong>Q: ${q.question}</strong></p>
                                            <p>A: ${q.answer}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </section>
            ` : ''}

            ${course.reviewsList && course.reviewsList.length > 0 ? `
                <section class="reviews">
                    <h2>Student Reviews</h2>
                    ${course.reviewsList.map(r => `
                        <div class="review">
                            <p><strong>${r.name}</strong> - ${r.rating}/5 (${r.date})</p>
                            <p>${r.text}</p>
                            ${r.achievement ? `<p><em>${r.achievement}</em></p>` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}

            ${course.testimonials && course.testimonials.length > 0 ? `
                <section class="testimonials">
                    <h2>Success Stories</h2>
                    ${course.testimonials.map(tcat => `
                        <div class="testimonial-category">
                            <h3>${tcat.category}</h3>
                            ${tcat.items.map(t => `
                                <div class="testimonial">
                                    <p><strong>${t.name}</strong> (${t.designation})</p>
                                    <blockquote>${t.message}</blockquote>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </section>
            ` : ''}
        </article>
    `;
};

const generateBlogHTML = (blog) => {
    if (!blog) return '';
    return `
        <article>
            <h1>${blog.title}</h1>
            <section class="blog-meta">
                <p><strong>Category:</strong> ${blog.category?.name || 'Blog'}</p>
                <p><strong>Published on:</strong> ${new Date(blog.createdAt).toLocaleDateString()}</p>
                <p><strong>Author:</strong> ${blog.author || 'Admin'}</p>
            </section>
            <div class="blog-content">${blog.description || ''}</div>
        </article>
    `;
};

const generateBranchLocatorHTML = (content) => {
    if (!content || !content.branches) return '';
    return `
        <main>
            <section class="branch-locator-header">
                <h1>${content.branchPage?.header?.title || 'Find a Branch Near You'}</h1>
                <p>${content.branchPage?.header?.description || ''}</p>
            </section>
            <section class="branch-list">
                ${content.branches.map(b => `
                    <article class="branch-card">
                        <h2>${b.name}</h2>
                        <p>${b.address}</p>
                        <p>${b.city}, ${b.state} - ${b.pincode}</p>
                        <p>Phone: ${b.phone} | Email: ${b.email}</p>
                        <p>Students: ${b.students}</p>
                        <p>Available Courses: ${(b.courses || b.facilities || []).join(', ')}</p>
                    </article>
                `).join('')}
            </section>
        </main>
    `;
};

const generateBranchDetailHTML = (branch, batches = []) => {
    if (!branch) return '';
    return `
        <article>
            <h1>${branch.name}</h1>
            <p class="address">${branch.address}</p>
            <p class="location">${branch.city}, ${branch.state} - ${branch.pincode}</p>
            
            <section class="contact-info">
                <h2>Contact Details</h2>
                <p><strong>Phone:</strong> ${branch.phone}</p>
                <p><strong>Email:</strong> ${branch.email}</p>
                <p><strong>Office Hours:</strong> ${branch.timings}</p>
            </section>

            <section class="stats">
                <h2>Branch Stats</h2>
                <p><strong>Active Students:</strong> ${branch.students}</p>
            </section>

            ${batches.length > 0 ? `
                <section class="upcoming-batches">
                    <h2>Upcoming Batches</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Starts On</th>
                                <th>Attempt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${batches.map(v => `
                                <tr>
                                    <td>${v.categories?.length > 0 ? v.categories.join(', ') : (v.category || 'Course')}</td>
                                    <td>${v.level}</td>
                                    <td>${v.startDate} (${v.dayTiming})</td>
                                    <td>${v.examAttempt}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>
            ` : ''}

            <section class="courses">
                <h2>Available Courses</h2>
                <ul>
                    ${(branch.courses || branch.facilities || []).map(c => `<li>${c}</li>`).join('')}
                </ul>
            </section>
        </article>
    `;
};

const generateHomeHTML = (content, trendingCourses = [], faculties = []) => {
    if (!content) return '';

    const alumniList = [
        { name: "Citibank", logo: "/assets/alumni/citibank.png" },
        { name: "HDFC Securities", logo: "/assets/alumni/hdfc-securities.png" },
        { name: "J.P. Morgan", logo: "/assets/alumni/jpmorgan.png" },
        { name: "Accenture", logo: "/assets/alumni/accenture.png" },
        { name: "KPMG", logo: "/assets/alumni/kpmg.png" },
        { name: "Kotak", logo: "/assets/alumni/kot.png" },
        { name: "Tata", logo: "/assets/alumni/tata.png" }
    ];

    return `
        <main>
            ${content.showAnnouncement && content.announcements && content.announcements.length > 0 ? `
                <section class="announcements">
                    <ul>
                        ${content.announcements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </section>
            ` : ''}

            <section class="legacy-stats">
                <h2>The JKSC Legacy</h2>
                <div class="stats-grid">
                    <div><strong>5,15,987+</strong> students till date</div>
                    <div><strong>43+</strong> years of experience</div>
                    <div><strong>377+</strong> faculties</div>
                    <div><strong>10</strong> States</div>
                    <div><strong>41</strong> cities</div>
                    <div><strong>116</strong> Face to Face Centres</div>
                    <div><strong>3,885+</strong> Rankers (since 2001)</div>
                </div>
            </section>

            ${content.aboutSection ? `
                <section class="about-banner">
                    <div class="badge">${content.aboutSection.badge || 'Discover JK Shah Classes'}</div>
                    <h2>${content.aboutSection.title || ''}</h2>
                    <p>${content.aboutSection.description || ''}</p>
                    <ul>${content.aboutSection.points?.map(p => `<li>${p}</li>`).join('') || ''}</ul>
                </section>
            ` : ''}

            <section class="hero">
                <div class="badge">${content.hero?.badge || ''}</div>
                <h1>${content.hero?.title || ''}</h1>
                <p>${content.hero?.description || ''}</p>
                <div class="hero-stats">
                    ${content.hero?.stats?.map(s => `<span>${s.label}: ${s.value}</span>`).join(' | ') || ''}
                </div>
            </section>

            ${trendingCourses.length > 0 ? `
                <section class="trending-courses">
                    <h2>Trending Courses</h2>
                    <div class="course-list">
                        ${trendingCourses.map(c => {
                            const cslug = c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const canonicalUrl = getCanonicalCourseUrl(cslug);
                            return `
                            <article class="course-card">
                                <a href="${canonicalUrl}">
                                    <h3>${c.title}</h3>
                                    <p>${c.category} ${c.level ? `| ${c.level}` : ''}</p>
                                    <p>Rating: ${c.rating} | Price: ₹${c.price}</p>
                                    <p>${c.duration} | ${c.facultyName}</p>
                                </a>
                            </article>
                        `}).join('')}
                    </div>
                </section>
            ` : ''}

            <section class="online-exp">
                <h2>${content.onlineExperience?.title || ''}</h2>
                <p>${content.onlineExperience?.description || ''}</p>
                <div class="features">
                    ${content.onlineExperience?.features?.map(f => `
                        <div class="feature">
                            <h3>${f.title}</h3>
                            <p>${f.description}</p>
                        </div>
                    `).join('') || ''}
                </div>
            </section>

            <section class="alumni">
                <h2>Our Alumni Work At</h2>
                <ul>
                    ${alumniList.map(a => `<li>${a.name}</li>`).join('')}
                </ul>
            </section>

            ${faculties.length > 0 ? `
                <section class="faculty">
                    <h2>Expert Faculty</h2>
                    <div class="faculty-list">
                        ${faculties.slice(0, 10).map(f => `
                            <div class="faculty-member">
                                <h3>${f.name}</h3>
                                <p>${f.designation}</p>
                                <p>${f.specialization}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            ` : ''}

            ${content.whyChooseUs ? `
                <section class="why-choose-us">
                    <h2>${content.whyChooseUs.title || 'Why Choose Us'}</h2>
                    <div class="stats-grid">
                        ${content.whyChooseUs.statsGrid?.map(s => `<div><strong>${s.value}</strong> ${s.label}</div>`).join('') || ''}
                    </div>
                    <h3>${content.whyChooseUs.featuresTitle || 'What You Get'}</h3>
                    <ul>${content.whyChooseUs.featuresList?.map(f => `<li>${f}</li>`).join('') || ''}</ul>
                </section>
            ` : ''}

            ${content.testimonials ? `
                <section class="testimonials">
                    <h2>${content.testimonials.title || 'Student Success Stories'}</h2>
                    <div class="testimonial-list">
                        ${content.testimonials.list?.map(t => `
                            <blockquote>
                                <p>"${t.text}"</p>
                                <cite>— ${t.name}, ${t.rank}</cite>
                            </blockquote>
                        `).join('') || ''}
                    </div>
                </section>
            ` : ''}

            ${content.videoCarousel ? `
                <section class="video-carousel">
                    <h2>${content.videoCarousel.title || 'Watch Our Classes in Action'}</h2>
                    <div class="video-list">
                        ${content.videoCarousel.videos?.map(v => `
                            <div class="video-item">
                                <h3>${v.title}</h3>
                                <p>${v.description || ''}</p>
                            </div>
                        `).join('') || ''}
                    </div>
                </section>
            ` : ''}

            ${content.learningEcosystem ? `
                <section class="learning-ecosystem">
                    <h2>${content.learningEcosystem.title || 'Complete Learning Ecosystem'}</h2>
                    <div class="ecosystem-features">
                        ${content.learningEcosystem.features?.map(f => `
                            <div class="eco-feature">
                                <h3>${f.title}</h3>
                                <p>${f.description}</p>
                            </div>
                        `).join('') || ''}
                    </div>
                </section>
            ` : ''}

            ${content.footerCta ? `
                <section class="footer-cta">
                    <h2>${content.footerCta.title}</h2>
                    <p>${content.footerCta.description}</p>
                </section>
            ` : ''}

            ${content.globalFooter ? `
                <footer class="footer">
                    <p>${content.globalFooter.description}</p>
                    <div class="contact-info">
                        <p>${content.globalFooter.contactInfo?.address}</p>
                        <p>${content.globalFooter.contactInfo?.phone}</p>
                        <p>${content.globalFooter.contactInfo?.email}</p>
                    </div>
                </footer>
            ` : ''}

            <nav class="site-navigation">
                <h2>Quick Links</h2>
                <ul>
                    <li><a href="/courses">All Courses</a></li>
                    <li><a href="/branches">Branches</a></li>
                    <li><a href="/ourachievers">Our Achievers</a></li>
                    <li><a href="/placements">Placement</a></li>
                    <li><a href="/resources">Resources</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/about/history">Our History</a></li>
                </ul>
            </nav>
        </main>
    `;
};

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rank-holders', rankHolderRoutes);
app.use('/api/course-timelines', courseTimelineRoutes);
app.use('/api/career-opportunities', careerOpportunityRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/branch-enquiry', branchEnquiryRoutes);
app.use('/api/branch-enquiries', branchEnquiryRoutes); // plural alias used by frontend
app.use('/api/alumni', alumniRoutes);
app.use('/api/alumni-work-at', alumniWorkAtRoutes);
app.use('/api/products', productRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/erp-course-mappings', erpCourseMappingRoutes);
app.use('/api/erp-batch-visibility', erpBatchVisibilityRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/payment-enquiries', paymentEnquiryRoutes);
app.use('/api/payment-enquiry', paymentEnquiryRoutes); // singular alias used by frontend
// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const distPath = path.resolve(__dirname, '../../dist');

// SEO Routes
app.get('/', async (req, res) => {
    try {
        const [content, trendingCourses, faculties] = await Promise.all([
            LandingPageContent.findOne(),
            Course.find({ status: "Active" }).limit(10),
            Faculty.find().limit(10)
        ]);

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            return res.status(404).send('Frontend build not found');
        }

        let html = fs.readFileSync(indexPath, 'utf8');
        if (content) {
            html = injectMeta(html, {
                title: content.metaTitle || "JK Shah Classes",
                description: content.metaDescription || "JK Shah Classes is India's top coaching institute for CA, CS, and CMA.",
                keywords: content.metaKeywords || "",
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: "/favicon.png",
                type: "website"
            });
            html = injectBody(html, generateHomeHTML(content, trendingCourses, faculties));
        }
        res.send(html);
    } catch (error) {
        console.error('Home SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.get('/blog/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug }).populate('category');
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return res.status(404).send('Frontend build not found');

        let html = fs.readFileSync(indexPath, 'utf8');
        if (blog) {
            html = injectMeta(html, {
                title: blog.metaTitle || `${blog.title} | JK Shah Classes`,
                description: blog.metaDescription || (blog.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
                keywords: blog.metaKeywords || "",
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: blog.image || "/favicon.png",
                type: "article"
            });
            html = injectBody(html, generateBlogHTML(blog));
            res.send(html);
        } else {
            res.status(404).send(html);
        }
    } catch (error) {
        console.error('Blog SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.get(['/course/:slug', '/courses/india/:slug', '/courses/foreign/:slug'], async (req, res) => {
    try {
        const { slug } = req.params;
        const generateSlug = (text) => {
            if (!text) return '';
            return text.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        const titlePattern = slug.replace(/-/g, ' ');
        let course = await Course.findOne({
            title: { $regex: new RegExp(`^${titlePattern}$`, 'i') }
        });

        if (!course) {
            const allCourses = await Course.find({ status: "Active" });
            course = allCourses.find(c => generateSlug(c.title) === slug || c.slug === slug || c._id.toString() === slug);
        }

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return res.status(404).send('Frontend build not found');

        let html = fs.readFileSync(indexPath, 'utf8');
        if (course) {
            const category = await Category.findOne({ name: course.subCategory });
            
            const cslug = course.slug || course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const canonicalPath = getCanonicalCourseUrl(cslug);
            const canonicalUrl = `https://jkshahclasses.com${canonicalPath}`;

            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://jkshahclasses.com/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Courses",
                        "item": "https://jkshahclasses.com/courses"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": course.title,
                        "item": canonicalUrl
                    }
                ]
            };
            const schemaScript = `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
            html = html.replace('</head>', `${schemaScript}\n</head>`);

            html = injectMeta(html, {
                title: course.metaTitle || (category && category.metaTitle) || `${course.title} | JK Shah Classes`,
                description: course.metaDescription || (category && category.metaDescription) || (course.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
                keywords: course.metaKeywords || (category && category.metaKeywords) || "",
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: course.image || "/favicon.png",
                type: "website"
            });
            html = injectBody(html, generateCourseHTML(course));
            res.send(html);
        } else {
            res.status(404).send(html);
        }
    } catch (error) {
        console.error('Course SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.get(['/courses/:categorySlug', '/courses'], async (req, res) => {
    try {
        const { categorySlug } = req.params;
        let category;

        const activeIdentifier = categorySlug;

        if (activeIdentifier) {
            if (activeIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
                category = await Category.findById(activeIdentifier);
            } else {
                const decodedName = decodeURIComponent(activeIdentifier);
                category = await Category.findOne({
                    $or: [
                        { slug: decodedName },
                        { name: { $regex: new RegExp(`^${decodedName}$`, 'i') } }
                    ]
                });
            }
            if (!category) {
                return res.redirect(301, '/courses');
            }
        }

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return res.status(404).send('Frontend build not found');

        let html = fs.readFileSync(indexPath, 'utf8');
        
        // Fetch courses for schema
        let courseQuery = { status: "Active" };
        if (category) {
            courseQuery.$or = [
                { category: category.name },
                { subCategory: category.name }
            ];
        }
        const courses = await Course.find(courseQuery).sort({ category: 1 });
        
        const uniqueCourses = new Map();
        courses.forEach(c => {
            const cslug = c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const canonicalPath = getCanonicalCourseUrl(cslug);
            if (!uniqueCourses.has(canonicalPath)) {
                uniqueCourses.set(canonicalPath, canonicalPath);
            }
        });

        const itemListElement = Array.from(uniqueCourses.values()).map((canonicalPath, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://jkshahclasses.com${canonicalPath}`
        }));

        if (itemListElement.length > 0) {
            const itemListSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": itemListElement
            };
            const schemaScript = `<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>`;
            html = html.replace('</head>', `${schemaScript}\n</head>`);
        }

        if (category) {
            html = injectMeta(html, {
                title: category.metaTitle || `${category.name} Courses | JK Shah Classes`,
                description: category.metaDescription || category.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Explore ${category.name} courses at JK Shah Classes.`,
                keywords: category.metaKeywords || `${category.name}, CA Coaching, CS Coaching, CMA Coaching`,
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: category.image || "/favicon.png",
                type: "website"
            });
        } else {
            // General courses page fallback
            html = injectMeta(html, {
                title: `Courses | JK Shah Classes`,
                description: `Explore professional certification programs designed for success at JK Shah Classes.`,
                keywords: `CA, CS, CMA, Coaching, Courses`,
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: "/favicon.png",
                type: "website"
            });
        }
        res.send(html);
    } catch (error) {
        console.error('Category SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.get('/branches', async (req, res) => {
    try {
        const content = await LandingPageContent.findOne();
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return res.status(404).send('Frontend build not found');

        let html = fs.readFileSync(indexPath, 'utf8');
        if (content) {
            html = injectMeta(html, {
                title: "Our Branches | JK Shah Classes",
                description: content.branchPage?.header?.description || "Find a JK Shah Classes branch near you. With over 35+ branches pan India.",
                keywords: "CA Coaching Branches, JK Shah Classes Locations, commerce coaching centers",
                url: `https://${req.get('host')}${req.originalUrl}`,
                image: "/favicon.png",
                type: "website"
            });
            html = injectBody(html, generateBranchLocatorHTML(content));
        }
        res.send(html);
    } catch (error) {
        console.error('Branches SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

app.get('/branch/:slug', async (req, res) => {
    try {
        const content = await LandingPageContent.findOne();
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return res.status(404).send('Frontend build not found');

        let html = fs.readFileSync(indexPath, 'utf8');
        if (content && content.branches) {
            const branch = content.branches.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === req.params.slug);
            if (branch) {
                const batches = await Batch.find({
                    location: branch.name,
                    mode: 'Face to Face'
                }).limit(20);
                html = injectMeta(html, {
                    title: branch.metaTitle || `${branch.name} | JK Shah Classes`,
                    description: branch.metaDescription || `Visit JK Shah Classes ${branch.name} at ${branch.address}. Expert faculty for CA, CS, and CMA coaching.`,
                    keywords: branch.metaKeywords || `${branch.name}, CA Coaching in ${branch.city}, commerce classes ${branch.city}`,
                    url: `https://${req.get('host')}${req.originalUrl}`,
                    image: branch.image || "/favicon.png",
                    type: "website"
                });
                html = injectBody(html, generateBranchDetailHTML(branch, batches));
                res.send(html);
                return;
            }
        }
        res.status(404).send(html);
    } catch (error) {
        console.error('Branch detail SEO error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// Handle Easebuzz POST webhook redirect
app.post('/paymentstatus', (req, res) => {
    // Easebuzz might send data in the body or query. Combine them.
    const combinedData = { ...req.query, ...req.body };
    const queryStr = new URLSearchParams(combinedData).toString();

    // Redirect browser to the React GET route
    res.redirect(302, `/paymentstatus?${queryStr}`);
});

// Static files
app.use(express.static(distPath));

// Final Fallback
app.get(/^(?!\/api).+/, (req, res) => {
    const knownStaticRoutes = [
        '/', '/login', '/signup', '/forgot-password', '/alumni', '/ourachievers',
        '/placements', '/test-series', '/privacy-policy', '/terms-and-conditions',
        '/refund-policy', '/resources/timetables', '/courses', '/branches',
        '/resources', '/resources/announcements', '/checkout', '/cart',
        '/payment-success', '/paymentstatus', '/privacy', '/terms',
        '/about/history', '/about/csr', '/faculty', '/careers', '/blog',
        '/live-sessions', '/student-dashboard', '/profile', '/course-player'
    ];
    
    const isKnownPrefix = ['/admin', '/student', '/reset-password', '/resources/books', '/resources/test-series'].some(prefix => req.path.startsWith(prefix));

    if (knownStaticRoutes.includes(req.path) || isKnownPrefix) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).sendFile(path.join(distPath, 'index.html'));
    }
});

const PORT = +process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

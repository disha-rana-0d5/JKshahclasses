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
const path = require('path');
const fs = require('fs');
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

// Helper to inject body content into #root
const injectBody = (html, content) => {
    return html.replace('<div id="root"></div>', `<div id="root">\n${content}\n</div>`);
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

const generateHomeHTML = (content) => {
    if (!content) return '';
    return `
        <main>
            <section class="hero">
                <h1>${content.hero?.title || ''}</h1>
                <p>${content.hero?.description || ''}</p>
            </section>
            <section class="about">
                <h2>${content.aboutSection?.title || ''}</h2>
                <p>${content.aboutSection?.description || ''}</p>
                <ul>${content.aboutSection?.points?.map(p => `<li>${p}</li>`).join('') || ''}</ul>
            </section>
            <section class="online-exp">
                <h2>${content.onlineExperience?.title || ''}</h2>
                <p>${content.onlineExperience?.description || ''}</p>
            </section>
        </main>
    `;
};

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

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
app.use('/api/branch-enquiries', branchEnquiryRoutes);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const distPath = path.resolve(__dirname, '../../dist');

// Route handler for blog detail page to inject meta tags
app.get('/blog/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug }).populate('category');

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            console.error('index.html not found at:', indexPath);
            return res.status(404).send('Frontend build not found');
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        if (blog) {
            html = injectMeta(html, {
                title: blog.metaTitle || `${blog.title} | JK Shah Classes`,
                description: blog.metaDescription || (blog.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
                keywords: blog.metaKeywords || ""
            });
            html = injectBody(html, generateBlogHTML(blog));
        }

        res.send(html);
    } catch (error) {
        console.error('Blog meta injection error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// Route handler for course detail pages to inject meta tags from category/subcategory
app.get(['/course/:slug', '/courses/india/:slug', '/courses/foreign/:slug'], async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('Course SEO request for slug:', slug);
        const titlePattern = slug.replace(/-/g, ' ');
        const course = await Course.findOne({
            title: { $regex: new RegExp(`^${titlePattern}$`, 'i') }
        });

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            console.error('index.html not found at:', indexPath);
            return res.status(404).send('Frontend build not found');
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        if (course) {
            console.log('Course found:', course.title, 'subCategory:', course.subCategory);
            // Find associated sub-category to get its meta tags as requested
            const category = await Category.findOne({ name: course.subCategory });

            if (category) {
                console.log('Category found for SEO:', category.name);
            } else {
                console.log('Category NOT found for SEO name:', course.subCategory);
            }

            html = injectMeta(html, {
                title: course.metaTitle || (category && category.metaTitle) || `${course.title} | JK Shah Classes`,
                description: course.metaDescription || (category && category.metaDescription) || (course.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || ""),
                keywords: course.metaKeywords || (category && category.metaKeywords) || ""
            });
            html = injectBody(html, generateCourseHTML(course));
        } else {
            console.log('Course NOT found for slug pattern:', titlePattern);
        }

        res.send(html);
    } catch (error) {
        console.error('Course meta injection error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

const LandingPageContent = require('./models/LandingPageContent');

app.get('/', async (req, res) => {
    try {
        const content = await LandingPageContent.findOne();
        const indexPath = path.join(distPath, 'index.html');

        if (!fs.existsSync(indexPath)) {
            return res.status(404).send('Frontend build not found');
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        if (content) {
            html = injectMeta(html, {
                title: content.metaTitle || "JK Shah Classes - India's Leading CA Coaching Institute",
                description: content.metaDescription || "JK Shah Classes is India's top coaching institute for CA, CS, and CMA.",
                keywords: content.metaKeywords || ""
            });
            html = injectBody(html, generateHomeHTML(content));
        }

        res.send(html);
    } catch (error) {
        console.error('Home meta injection error:', error);
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// Serve static files from the React app dist folder
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// For any other route, serve the index.html (SPA Fallback)
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = +process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

const mongoose = require('mongoose');

const landingPageContentSchema = new mongoose.Schema({
    announcementText: { type: String, default: 'Welcome to JK Shah Classes - India\'s Leading CA Coaching Institute!' },
    announcements: { type: [String], default: ['Welcome to JK Shah Classes - India\'s Leading CA Coaching Institute!'] },
    showAnnouncement: { type: Boolean, default: true },
    hero: {
        badge: { type: String, default: 'Top Ranked Institute 2024' },
        title: { type: String, default: "Master CA, CS & CMA with India's Leading Coaching Institute" },
        description: { type: String, default: "50,000+ successful professionals started here. Expert faculty, proven methodology, and comprehensive support for your career transformation." },
        ctaDemoText: { type: String, default: 'Watch Demo Class' },
        ctaCoursesText: { type: String, default: 'View Courses' },
        videos: {
            type: [{
                thumbnail: { type: String },
                videoUrl: { type: String }
            }],
            default: [
                { thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' },
                { thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' },
                { thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' },
                { thumbnail: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' },
                { thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' }
            ]
        },
        videoCaption: { type: String, default: 'Live & Recorded Classes Available' },
        stats: {
            type: [{
                value: { type: String },
                label: { type: String }
            }],
            default: [
                { value: '98%', label: 'Success Rate' },
                { value: '50K+', label: 'Students' },
                { value: '450+', label: 'Rank Holders' }
            ]
        },
        quickInfo: {
            type: [{
                label: { type: String },
                value: { type: String }
            }],
            default: [
                { label: 'Next Batch', value: 'Jan 15, 2024' },
                { label: 'Limited Seats', value: '45 Left' }
            ]
        }
    },
    // popularPrograms: {
    //     title: { type: String, default: 'Popular Programs' },
    //     subtitle: { type: String, default: 'Choose your path to success' },
    //     programs: [
    //         { title: { type: String }, categoryId: { type: String }, iconName: { type: String }, color: { type: String } }
    //     ]
    // },
    onlineExperience: {
        badge: { type: String, default: 'Premium Online Learning' },
        title: { type: String, default: 'Legacy Coaching, Modern Delivery' },
        description: { type: String, default: 'Experience the perfect blend of our 40+ years of teaching excellence with cutting-edge technology.' },
        features: [
            { title: { type: String }, description: { type: String }, iconName: { type: String }, color: { type: String } }
        ],
        image: { type: String, default: 'https://images.unsplash.com/photo-1758874385197-07d99c183a6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHZpZGVvJTIwY2FsbCUyMG9ubGluZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2NzExNDM1MXww&ixlib=rb-4.1.0&q=80&w=1080' },
        videoUrl: { type: String, default: 'https://www.youtube.com/watch?v=3V1NGxcVdkI' },
        floatingStats: [
            { label: { type: String }, value: { type: String }, iconName: { type: String } }
        ]
    },
    aboutSection: {
        badge: { type: String, default: 'About JK Shah Classes' },
        title: { type: String, default: 'Empowering Future Professionals Since 1983' },
        description: { type: String, default: 'For over four decades, JK Shah Classes has been at the forefront of CA, CS, and CMA coaching. Our commitment to excellence and student success has made us India\'s most trusted institute.' },
        image: { type: String, default: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
        videoUrl: { type: String, default: '' },
        points: {
            type: [String],
            default: [
                'Pioneers in professional coaching with 40+ years of legacy',
                'Highest number of All India Rankers annually',
                'Comprehensive study material tailored for exam success',
                'Personalized mentorship and doubt-clearing sessions'
            ]
        }
    },
    whyChooseUs: {
        title: { type: String, default: 'Why Choose Us' },
        statsGrid: {
            type: [{
                label: { type: String },
                value: { type: String },
                color: { type: String }
            }],
            default: [
                { value: "50,000+", label: "Students", color: "primary" },
                { value: "98%", label: "Success", color: "accent" },
                { value: "450+", label: "Rankers", color: "primary" },
                { value: "35+", label: "Branches", color: "accent" }
            ]
        },
        featuresTitle: { type: String, default: 'What You Get' },
        featuresList: {
            type: [String],
            default: [
                "Expert Faculty with 15+ Years Experience",
                "Comprehensive Study Material & Notes",
                "Regular Mock Tests & Assessments",
                "Doubt Clearing Sessions",
                "Online + Offline Classes",
                "Placement Assistance"
            ]
        }
    },
    videoCarousel: {
        title: { type: String, default: 'Watch Our Classes in Action' },
        videos: {
            type: [{
                title: { type: String },
                videoUrl: { type: String },
                thumbnailUrl: { type: String },
                description: { type: String }
            }],
            default: []
        }
    },
    testimonials: {
        title: { type: String, default: 'Student Success Stories' },
        list: [
            { name: { type: String }, rank: { type: String }, text: { type: String }, image: { type: String } }
        ]
    },
    facultySection: {
        title: { type: String, default: 'Expert Faculty' },
        subtitle: { type: String, default: 'Learn from industry leaders' }
    },
    facultyPage: {
        header: {
            badge: { type: String, default: "World-Class Faculty" },
            titleLine1: { type: String, default: "Learn from the" },
            titleHighlight: { type: String, default: "Best Minds" },
            description: { type: String, default: "Meet the educators who've mentored 50,000+ successful professionals across India. Their expertise is your advantage." }
        },
        stats: {
            type: [{
                iconName: { type: String },
                value: { type: String },
                label: { type: String },
                sublabel: { type: String }
            }],
            default: [
                { iconName: "GraduationCap", value: "100+", label: "Expert Faculty", sublabel: "Across all programs" },
                { iconName: "Users", value: "50,000+", label: "Students Mentored", sublabel: "Pan India reach" },
                { iconName: "Trophy", value: "1,850+", label: "Top Rankers", sublabel: "All India ranks" },
                { iconName: "TrendingUp", value: "98%", label: "Success Rate", sublabel: "Industry leading" }
            ]
        },
        cta: {
            title: { type: String, default: "Ready to Learn from the Best?" },
            description: { type: String, default: "Book a free consultation with our faculty and discover your path to success" },
            demoBtnText: { type: String, default: "Book Free Demo Class" },
            interviewBtnText: { type: String, default: "Watch Faculty Interviews" }
        },
        trustIndicators: {
            type: [{ iconName: String, text: String }],
            default: [
                { iconName: "CheckCircle2", text: "100% Expert Faculty" },
                { iconName: "Award", text: "Industry Certified" },
                { iconName: "Target", text: "Result-Oriented Teaching" }
            ]
        }
    },
    learningEcosystem: {
        title: { type: String, default: 'Complete Learning Ecosystem' },
        features: [
            { title: { type: String }, description: { type: String }, iconName: { type: String }, color: { type: String } }
        ]
    },
    footerCta: {
        title: { type: String, default: 'Ready to Begin Your Success Story?' },
        description: { type: String, default: 'Join 50,000+ students and start your professional journey today' },
        demoButtonText: { type: String, default: 'Book Free Demo' },
        brochureButtonText: { type: String, default: 'Download Brochure' },
        brochureUrl: { type: String }
    },
    globalFooter: {
        description: { type: String, default: 'Professional education platform empowering students in CA, CS, CMA courses with expert guidance.' },
        contactInfo: {
            address: { type: String, default: 'Multiple locations across Mumbai, Delhi, Bangalore, Pune, India' },
            phone: { type: String, default: '+91 123 456 7890' },
            email: { type: String, default: 'info@jkshah.com' }
        },
        quickLinks: {
            type: [{ name: String, path: String }],
            default: [
                { name: "Home", path: "/" },
                { name: "Courses", path: "/courses" },
                { name: "Branches", path: "/branches" },
                { name: "Faculty", path: "/faculty" },
                { name: "Online Learning", path: "/live-sessions" },
                { name: "Student Dashboard", path: "/" }
            ]
        },
        popularCourses: {
            type: [{ name: String, path: String }],
            default: [
                { name: "CA Foundation", path: "/courses/ca-foundation" },
                { name: "CA Intermediate", path: "/courses/ca-intermediate" },
                { name: "CA Final", path: "/courses/ca-final" },
                { name: "CS Executive", path: "/courses/cs-executive" },
                { name: "CS Professional", path: "/courses/cs-professional" },
                { name: "CMA Intermediate", path: "/courses/cma-intermediate" },
                { name: "CMA Final", path: "/courses/cma-final" }
            ]
        },
        stats: {
            type: [{ value: String, label: String }],
            default: [
                { value: "25k+", label: "Students" },
                { value: "50+", label: "Courses" },
                { value: "94%", label: "Success" }
            ]
        },
        socialLinks: {
            type: [{ platform: String, url: String }],
            default: [
                { platform: "Facebook", url: "#" },
                { platform: "Twitter", url: "#" },
                { platform: "Instagram", url: "#" },
                { platform: "LinkedIn", url: "#" },
                { platform: "YouTube", url: "#" }
            ]
        }
    },
    branchPage: {
        header: {
            badge: { type: String, default: "35+ Branches Pan India" },
            title: { type: String, default: "Find a Branch Near You" },
            description: { type: String, default: "Visit our state-of-the-art learning centers equipped with modern facilities and experienced faculty" }
        },
        stats: {
            type: [{
                value: { type: String },
                label: { type: String }
            }],
            default: [
                { value: "35+", label: "Branches Across India" },
                { value: "50,000+", label: "Active Students" },
                { value: "450+", label: "Rank Holders" },
                { value: "98%", label: "Success Rate" }
            ]
        },
        cta: {
            title: { type: String, default: "Visit Our Nearest Branch" },
            description: { type: String, default: "Experience our world-class infrastructure and meet our expert faculty in person" },
            scheduleBtn: { type: String, default: "Schedule a Visit" },
            downloadBtn: { type: String, default: "Download Branch List" }
        }
    },
    branches: {
        type: [{
            id: { type: Number }, // Keep existing numeric IDs for simplicity or auto-generate
            name: { type: String },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            phone: { type: String },
            email: { type: String },
            timings: { type: String },
            image: { type: String },
            // Coordinates removed
            mapUrl: { type: String },
            facilities: [String],
            courses: [String],
            faculties: [String],
            students: { type: String }
        }],
        default: [
            {
                id: 1,
                name: "Andheri West Branch",
                address: "4th Floor, Pinnacle Corporate Park, BKC, Andheri West",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400053",
                phone: "+91 22 2673 4567",
                email: "andheri@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.870832095598!2d72.8697!3d19.1136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzQ5LjAiTiA3MsKwNTInMTAuOSJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Cafeteria", "Parking"],
                students: "2,500+"
            },
            {
                id: 2,
                name: "Dadar Branch",
                address: "2nd Floor, Sterling Plaza, Near Dadar Station, Dadar East",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400014",
                phone: "+91 22 2414 8901",
                email: "dadar@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.987654321!2d72.8561!3d19.0176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAxJzAzLjQiTiA3MsKwNTEnMjIuMCJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Computer Lab"],
                students: "1,800+"
            },
            {
                id: 3,
                name: "Thane Branch",
                address: "3rd Floor, Korum Mall, Eastern Express Highway, Thane",
                city: "Thane",
                state: "Maharashtra",
                pincode: "400606",
                phone: "+91 22 2580 3456",
                email: "thane@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.123456789!2d72.9781!3d19.2183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzA1LjkiTiA3MsKwNTgnNDEuMiJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Cafeteria", "Parking", "Wi-Fi"],
                students: "2,200+"
            },
            {
                id: 4,
                name: "Pune - FC Road Branch",
                address: "5th Floor, Pride Purple Square, Fergusson College Road",
                city: "Pune",
                state: "Maharashtra",
                pincode: "411004",
                phone: "+91 20 2567 8912",
                email: "pune-fc@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.456789012!2d73.8567!3d18.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMxJzEzLjQiTiA3M8KwNTEnMjQuMSJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Computer Lab", "Parking"],
                students: "1,900+"
            },
            {
                id: 5,
                name: "Delhi - Laxmi Nagar Branch",
                address: "Ground Floor, Metro Plaza, Near Laxmi Nagar Metro Station",
                city: "Delhi",
                state: "Delhi",
                pincode: "110092",
                phone: "+91 11 4567 2345",
                email: "delhi-ln@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.123456789!2d77.2764!3d28.6345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM4JzA0LjIiTiA3N8KwMTYnMzUuMCJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Cafeteria"],
                students: "1,600+"
            },
            {
                id: 6,
                name: "Bangalore - Koramangala Branch",
                address: "4th Floor, Prestige Towers, 80 Feet Road, Koramangala",
                city: "Bangalore",
                state: "Karnataka",
                pincode: "560034",
                phone: "+91 80 4123 6789",
                email: "bangalore@jkshahclasses.com",
                timings: "Mon-Sat: 8:00 AM - 8:00 PM",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.123456789!2d77.6245!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzA2LjciTiA3N8KwMzcnMjguMiJF!5e0!3m2!1sen!2sin!4v1625123456789!5m2!1sen!2sin",
                facilities: ["AC Classrooms", "Library", "Computer Lab", "Wi-Fi", "Parking"],
                students: "2,100+"
            }
        ]
    },
    metaTitle: { type: String, default: 'JK Shah Classes - India\'s Leading CA Coaching Institute' },
    metaDescription: { type: String, default: 'JK Shah Classes is India\'s top coaching institute for CA, CS, and CMA. With over 40 years of excellence and 1,850+ All India Rankers.' },
    metaKeywords: { type: String, default: 'CA Coaching, CS Coaching, CMA Coaching, JK Shah Classes, Professional Courses' }
}, { timestamps: true });

module.exports = mongoose.model('LandingPageContent', landingPageContentSchema);

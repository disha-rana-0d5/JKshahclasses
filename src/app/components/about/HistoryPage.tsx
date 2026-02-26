import { motion } from "motion/react";
import {
    History,
    MapPin,
    Users,
    Trophy,
    Target,
    Heart,
    Award,
    Navigation,
    CheckCircle2,
    Calendar,
    Building2,
    GraduationCap,
    Globe,
    ArrowRight
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";

export function HistoryPage() {

    const leadership = [
        {
            name: "Prof. CA J.K. Shah",
            role: "Founder & Chairman",
            image: "/uploads/leadership/jk-shah.jpg",
            description: "An educator at heart, institution-builder by vision, and mentor to thousands of professionals who now lead industries across India and globally."
        },
        {
            name: "CA Pooja Shah-Dharia",
            role: "Joint COO - Head, Face-to-Face Business",
            image: "/uploads/leadership/pooja-shah.jpg",
            description: "Blending legacy with innovation, ensuring that the institution remains relevant to every generation of commerce aspirants."
        },
        {
            name: "CA Vishal Shah",
            role: "Joint COO - Head, Online Business",
            image: "/uploads/leadership/vishal-shah.jpg",
            description: "Combining tradition with technology to expand the reach and impact of quality commerce education."
        }
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-[#373081] text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-accent transform -skew-x-12 origin-top-right opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white transform skew-x-12 origin-bottom-left opacity-5"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent px-4 py-1 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                            <Calendar className="w-4 h-4" />
                            <span>Est. 1983</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Our Journey of <span className="text-accent text-shadow-md">Excellence</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-light italic text-white/90 border-l-4 border-accent pl-6 py-2 max-w-2xl mx-auto text-left md:text-center md:border-l-0 md:pl-0">
                            "Commerce education must be structured, conceptual and uncompromising."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Legacy Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Genesis of a Vision</h2>
                        <div className="space-y-4 text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                            <p>
                                In 1983, Prof. CA J.K. Shah began with a simple yet powerful belief:
                            </p>
                            <p className="font-bold border-l-4 border-primary pl-4 text-left md:text-center md:border-l-0 md:pl-0">
                                Commerce education must be structured, conceptual and uncompromising.
                            </p>
                            <p>
                                At a time when CA Final Costing was considered the "waterloo subject" for aspirants, he set out to simplify it. What began as focused coaching for one paper soon evolved into something much larger - a structured academic system that students could rely on. That system became J.K. Shah Classes.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Expansion Section */}
            <section className="py-12 bg-slate-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">From One Subject to a Complete Institution</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Over the decades, JKSC integrated backward - expanding from CA Final to cover every level of the Chartered Accountancy journey and beyond.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {[
                        {
                            title: "CA Journey",
                            items: ["CA Foundation", "CA Intermediate", "CA Final"],
                            icon: GraduationCap,
                            gradient: "from-blue-600 to-indigo-700",
                            lightBg: "bg-blue-50"
                        },
                        {
                            title: "Professional Courses",
                            items: ["CMA (India)", "Company Secretary (CS)", "ACCA"],
                            icon: Award,
                            gradient: "from-purple-600 to-indigo-800",
                            lightBg: "bg-purple-50"
                        },
                        {
                            title: "Global Pathways",
                            items: ["CMA (USA)", "CPA (USA)", "CFA® Programme"],
                            icon: Globe,
                            gradient: "from-emerald-500 to-teal-700",
                            lightBg: "bg-emerald-50"
                        }
                    ].map((category, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
                        >
                            <div className={`h-2 w-full bg-gradient-to-r ${category.gradient}`}></div>
                            <div className="p-8">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-gradient-to-br ${category.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-6 text-foreground group-hover:text-primary transition-colors">{category.title}</h3>
                                <ul className="space-y-4">
                                    {category.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-muted-foreground font-medium group/item">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient} opacity-40 group-hover/item:opacity-100 transition-opacity`}></div>
                                            <span className="group-hover/item:text-foreground transition-colors">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={`absolute bottom-0 right-0 w-32 h-32 ${category.lightBg} rounded-tl-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 -mr-8 -mb-8`}></div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Our Numbers Speak Banner Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#373081] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl"
                    >
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-20 hidden md:block">
                            <div className="grid grid-cols-1 gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-4 h-4 border-r-4 border-t-4 border-white rotate-45 ml-auto"></div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 p-8 opacity-10 hidden md:block">
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-12">Our Numbers Speak</h2>

                            {/* Top Row Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 border-b border-white/10 pb-12">
                                {[
                                    { value: "42", label: "Years Of\nexperience" },
                                    { value: "375+", label: "Faculties" },
                                    { value: "10", label: "States" },
                                    { value: "49", label: "Cities" },
                                    { value: "124", label: "Face to Face\nCentres" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="relative flex flex-col items-start px-2">
                                        {idx > 0 && <div className="absolute left-[-1rem] top-0 bottom-0 w-px bg-white/20 hidden md:block"></div>}
                                        <p className="text-4xl md:text-5xl font-bold mb-3">{stat.value}</p>
                                        <p className="text-xs md:text-sm text-white/70 whitespace-pre-line leading-tight font-medium tracking-wide uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Row Stats */}
                            <div className="flex flex-wrap gap-x-16 gap-y-8">
                                {[
                                    { value: "3,885", label: "All Courses Rankers\nSince 2001" },
                                    { value: "5,00,000+", label: "Students Till Date" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex flex-col items-start">
                                        <p className="text-4xl md:text-6xl font-bold mb-3">{stat.value}</p>
                                        <p className="text-xs md:text-sm text-white/70 whitespace-pre-line leading-tight font-medium tracking-wide uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Leadership Academic Legacy</h2>
                        <p className="text-gray-400">The visionaries behind our academic excellence.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {leadership.map((leader, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-accent/20 group-hover:border-accent transition-colors duration-500">
                                    <ImageWithFallback
                                        src={leader.image}
                                        alt={leader.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                                <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4 h-10">{leader.role}</p>
                                <div className="w-12 h-1 bg-accent/30 mb-4 group-hover:w-24 transition-all duration-500"></div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {leader.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Responsibility Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                                <Heart className="w-4 h-4" />
                                <span>Beyond Education: Responsibility</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Success Must Be Shared</h2>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    The story of JK Shah Classes is not only about academic success. It is also about responsibility.
                                </p>
                                <p className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl italic">
                                    "Every month, Prof. CA J.K. Shah personally leads the distribution of ration kits to 800+ needy families, including many of JKSC's support staff and economically vulnerable households."
                                </p>
                                <p>
                                    An institution that builds professionals must also support the communities around it.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative p-2 bg-slate-100 rounded-3xl"
                        >
                            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-3xl -m-4 animate-spin-slow"></div>
                            <ImageWithFallback
                                src="/uploads/history/csr-activity.jpg"
                                alt="CSR Activity"
                                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white shadow-xl p-6 rounded-2xl max-w-xs md:flex items-center gap-4 hidden">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">800+</p>
                                    <p className="text-xs text-muted-foreground font-semibold">Families Supported Monthly</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* The Story Continues */}
            <section className="py-16 bg-[#373081] text-white px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl font-bold mb-8">The Story Continues</h2>
                    <p className="text-xl text-white/80 mb-12">
                        From chalkboards to digital classrooms. From a single subject to global finance programmes. From one centre to a nationwide presence.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {["Clarity in teaching.", "Discipline in execution.", "Commitment to success."].map((text, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-[#373081] font-bold">
                                    {i + 1}
                                </div>
                                <p className="font-bold text-lg">{text}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-2xl font-bold text-accent mb-8">And the journey is far from over.</p>

                    <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 font-bold px-8"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        Our Mission & Values
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.div>
            </section>
        </div>
    );
}

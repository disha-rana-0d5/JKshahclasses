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
import { CountingNumber } from "../ui/CountingNumber";

export function HistoryPage() {

    const leadership = [
        {
            name: "Prof. CA J.K. Shah",
            role: "Founder & Chairman",
            image: "/uploads/2026/03/Picture 2.png",
            description: "An educator at heart, institution-builder by vision, and mentor to thousands of professionals who now lead industries across India and globally."
        },
        {
            name: "CA Pooja Shah-Dharia",
            role: "Joint COO - Head, Face-to-Face Business",
            image: "/uploads/2026/05/Pooja Shah.jpg",
            description: "Blending legacy with innovation, ensuring that the institution remains relevant to every generation of commerce aspirants."
        },
        {
            name: "CA Vishal Shah",
            role: "Joint COO - Head, Online Business",
            image: "/uploads/2026/05/Vishal Shah.jpg",
            description: "Combining tradition with technology to expand the reach and impact of quality commerce education."
        }
    ];

    const leadershipTeam = [
        { name: "Prof. Chetan Patil", department: "11th and 12th Standard & CAFC", image: "/uploads/2026/05/WhatsApp Image 2026-05-29 at 5.53.22 PM.jpeg" },
        { name: "Prof. Dhaval Thakkar", department: "CA", image: "/uploads/2026/05/CA (Prof. Dhaval Thakkar).jpeg" },
        { name: "Prof. Mit Sachdev", department: "CS Offline", image: "/uploads/2026/05/CS ( CS Mit Sachdev ).png" },
        { name: "Prof. Sagar Tolani", department: "CS Online", image: "/uploads/2026/05/CS (CS Sagar Tolani).png" },
        { name: "Prof. Sandesh Gupta", department: "CMA India / CMA USA", image: "/uploads/2026/05/CMA India (Prof. Sandesh Gupta).png" },
        { name: "Prof. Karan Agarwal", department: "ACCA", image: "/uploads/2026/05/ACCA (Prof. Karan Agarwal).jpeg" },
        { name: "Prof. Mihir Dedhia", department: "CFA", image: "/uploads/2026/05/CFA (Mihir Dedhia).jpeg" },
        { name: "Prof. Sumit Redekar", department: "CMA India / CMA USA", image: "/uploads/2026/05/CMA USA (Prof. Sumit Redekar).png" },
        { name: "Prof. Biplab Mondal", department: "CA Online", image: "/uploads/2026/05/Head - Online Production and Sales & Marketing (Biplab Mondal).png" },
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[35vh] min-h-[300px] flex items-center justify-center bg-[#373081] text-white">
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
                        <p className="text-xl md:text-2xl font-light italic text-white/90 border-l-4 border-accent pl-6 py-2 max-w-4xl mx-auto text-left md:text-center md:border-l-0 md:pl-0">
                            "Commerce education must be structured, conceptual and uncompromising."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Legacy Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-3xl overflow-hidden border-8 border-slate-50 shadow-xl max-w-md mx-auto lg:mx-0">
                                <ImageWithFallback
                                    src={leadership[0].image}
                                    alt="Prof. CA J.K. Shah"
                                    className="w-full h-auto object-cover aspect-[4/5] lg:max-h-[450px]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#373081]/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                                    <p className="text-2xl font-extrabold mb-0.5">{leadership[0].name}</p>
                                    <p className="text-accent font-bold tracking-[0.1em] uppercase text-xs">{leadership[0].role}</p>
                                </div>
                            </div>

                            {/* Premium Decorative Elements */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>

                            {/* Geometric accents */}
                            <div className="absolute -top-6 right-12 w-24 h-24 border-2 border-accent/20 rounded-full -z-10"></div>
                            <div className="absolute bottom-1/4 -left-8 w-16 h-16 bg-accent rounded-2xl rotate-45 opacity-20 -z-10"></div>

                            {/* Experience Badge */}
                            {/* <div className="absolute -bottom-6 -left-6 bg-white shadow-xl p-5 rounded-2xl z-20 border border-slate-100 flex items-center gap-4">
                                <div className="bg-accent/10 p-3 rounded-xl">
                                    <Trophy className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-[#373081]">43+</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Years of Legacy</p>
                                </div>
                            </div> */}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                                <History className="w-4 h-4" />
                                <span>The Beginning</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#373081] mb-6 leading-tight">
                                The <span className="text-accent italic">Genesis</span> <br />of a Vision
                            </h2>
                            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                                <p className="text-lg font-semibold text-slate-700 border-l-4 border-accent pl-4 py-1">
                                    In 1983, Prof. CA J.K. Shah began with a simple yet powerful belief:
                                </p>

                                <div className="relative py-6 px-8 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                    <div className="absolute top-2 left-4 text-5xl text-accent/20 font-serif leading-none">“</div>
                                    <p className="text-xl md:text-2xl font-extrabold text-[#373081] relative z-10 leading-snug">
                                        Commerce education must be structured, conceptual and uncompromising.
                                    </p>
                                    <div className="absolute bottom-0 right-4 text-5xl text-accent/20 font-serif leading-none rotate-180">“</div>
                                </div>

                                <p className="text-lg">
                                    At a time when CA Final Costing was considered the "Waterloo subject" for aspirants, he set out to simplify it. What began as focused coaching for one paper soon evolved into something much larger - a structured academic system that students could rely on.
                                </p>

                                <div className="flex items-center gap-4 text-[#373081]">
                                    <div className="h-px flex-grow bg-slate-200"></div>
                                    <p className="font-black text-sm uppercase tracking-widest">J.K. Shah Classes</p>
                                    <div className="h-px flex-grow bg-slate-200"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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

                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                    {[
                        {
                            title: "Indian Courses",
                            items: ["Chartered Accountant (CA)", "Cost & Management Accountants (CMA) India", "Company Secretary (CS)"],
                            icon: GraduationCap,
                            gradient: "from-blue-600 to-indigo-700",
                            lightBg: "bg-blue-50"
                        },
                        // {
                        //     title: "Foreign Courses",
                        //     items: ["CMA (India)", "Company Secretary (CS)", "ACCA"],
                        //     icon: Award,
                        //     gradient: "from-purple-600 to-indigo-800",
                        //     lightBg: "bg-purple-50"
                        // },
                        {
                            title: "Global Pathways",
                            items: ["Association of Chartered Certified Accountants (ACCA)", "Certified Financial Analyst (CFA)", "Cost & Management Accountants (CMA) US"],
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
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
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
                                        className="w-full h-full object-cover transition-all duration-500 scale-110"
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

            {/* Our Leadership Team Section */}
            {/* <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
               
                <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mb-48 blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-5xl font-black text-[#373081] mb-4">Our Leadership Team</h2>
                        <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leadershipTeam.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="group relative flex items-center gap-5 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500"
                            >
                              
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-accent rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center"></div>

                             
                                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-125"></div>
                                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md z-10 bg-slate-100">
                                        <ImageWithFallback
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                </div>

                            
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-base md:text-lg font-black text-[#373081] mb-1 group-hover:text-accent transition-colors truncate">
                                        {member.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors"></div>
                                        <p className="text-[10px] md:text-[11px] text-muted-foreground font-extrabold uppercase tracking-widest whitespace-nowrap">
                                            {member.department}
                                        </p>
                                    </div>
                                </div>

                            
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}

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

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 lg:gap-4">
                                {[
                                    { value: "43+", label: "Years Of\nexperience" },
                                    { value: "377+", label: "Faculties" },
                                    { value: "10", label: "States" },
                                    { value: "53", label: "Cities" },
                                    { value: "146", label: "Face to Face\nCentres" },
                                    { value: "3977+", label: "All Courses Rankers\nSince 2001" },
                                    { value: "515987+", label: "Students Till\nDate" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="relative flex flex-col items-start px-2 group">
                                        {idx > 0 && <div className="absolute left-[-0.75rem] top-2 bottom-2 w-px bg-white/10 hidden lg:block"></div>}
                                        <p className="text-3xl lg:text-3xl xl:text-4xl font-extrabold mb-2 text-white group-hover:text-accent transition-colors">
                                            <CountingNumber value={stat.value} />
                                        </p>
                                        <p className="text-[10px] xl:text-xs text-white/60 whitespace-pre-line leading-tight font-bold tracking-wider uppercase">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Story Continues */}
            {/* <section className="py-16 bg-[#373081] text-white px-4 sm:px-6 lg:px-8 text-center">
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
            </section> */}
        </div>
    );
}

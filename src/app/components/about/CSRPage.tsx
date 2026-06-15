import { motion } from "motion/react";
import {
    Heart,
    Target,
    Users,
    ArrowRight,
    Quote,
    GraduationCap,
    Calendar,
    HelpingHand,
    Sparkles
} from "lucide-react";
import { CountingNumber } from "../ui/CountingNumber";
import { Button } from "../ui/button";

export function CSRPage() {
    const dummyImages = [
        "/uploads/2026/05/22_12_2025_page-0001.jpg",
        "/uploads/2026/05/22_12_2025_page-0005.jpg",
        "/uploads/2026/05/22_12_2025_page-0006.jpg",
        "/uploads/2026/05/22_12_2025_page-0010.jpg",
        "/uploads/2026/05/22_12_2025_page-0011.jpg",
        "/uploads/2026/05/22_12_2025_page-0013.jpg",
        "/uploads/2026/05/22_12_2025_page-0012.jpg",
        "/uploads/2026/05/22_12_2025_page-0014.jpg",
        "/uploads/2026/05/22_12_2025_page-0019.jpg",
    ];

    // Duplicate images for seamless loop
    const carouselImages = [...dummyImages, ...dummyImages, ...dummyImages];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[35vh] min-h-[300px] flex items-center justify-center bg-[#373081] text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-accent transform -skew-x-12 origin-top-right opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white transform skew-x-12 origin-bottom-left opacity-5"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent px-4 py-1 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                            <Heart className="w-4 h-4 fill-accent" />
                            <span>Giving Back</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Corporate Social <span className="text-accent">Responsibility</span>
                        </h1>
                        <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto">
                            Empowering communities and nurturing a hunger-free nation.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Trust Name Section */}
            <section className="py-12 px-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-white rounded-[100px] blur-[120px] opacity-50 -z-10"></div>

                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative p-8 md:p-12 rounded-3xl bg-white shadow-xl border border-slate-100"
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accent text-white p-3 rounded-2xl shadow-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>

                        <h2 className="text-xl md:text-3xl font-black text-[#373081] mb-4 leading-tight mt-4">
                            Hansaben Kantilal Shah & Radha Ramakrishna Baliga Charitable Trust (HKSRRB)
                        </h2>

                        <div className="w-20 h-1 bg-accent mx-auto rounded-full mb-6"></div>

                        <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto italic leading-relaxed">
                            "True leadership is not just about institutional growth, but about lifting those who need it the most."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group p-8 rounded-3xl bg-[#373081] text-white relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <HelpingHand className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    <Target className="w-4 h-4" />
                                    <span>Our Mission</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Alleviating Hunger & Poverty</h3>
                                <p className="text-base text-white/80 leading-relaxed">
                                    At HKSRRB Trust, our mission is to alleviate hunger and poverty across India. We are committed to providing sustenance to those in need and nurturing a society where no one goes to sleep hungry.
                                </p>
                            </div>
                        </motion.div>

                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group p-8 rounded-3xl border-2 border-slate-100 bg-white relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-24 h-24 text-accent" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    <Users className="w-4 h-4" />
                                    <span>Our Vision</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#373081] mb-4">A Hunger-Free India</h3>
                                <p className="text-base text-slate-600 leading-relaxed">
                                    Our vision is a hunger-free India, where every citizen has access to nutritious meals. We aspire to create a network of support that extends from compassionate individuals to socially responsible corporates.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-16 bg-[#373081] text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-[40px] border border-white/20 text-center"
                        >
                            <div className="text-6xl md:text-7xl font-black text-accent mb-2">
                                <CountingNumber value="1000+" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-wider">Families Supported</h3>
                            <div className="w-16 h-1 bg-accent/30 mx-auto mb-6"></div>
                            <p className="text-white/70 text-base max-w-md mx-auto">
                                Providing monthly groceries and essential sustenance across Mumbai, growing from just 7 families in 2013.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl md:text-4xl font-black leading-tight">
                                Our Story of <br /><span className="text-accent italic">Compassion</span>
                            </h2>
                            <div className="space-y-4 text-base text-white/80 leading-relaxed">
                                <p>
                                    HKSRRB Charitable Trust was set up in 2010 by <strong>Mr. J. K. Shah</strong>, the founder of J. K. Shah Classes, and his wife, <strong>CA Purnima J. Shah</strong>.
                                </p>
                                <p>
                                    Since commencing activities in 2013, we have expanded our reach significantly. However, our journey doesn’t stop here; we aim to extend our reach, touching the lives of countless more.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Horizontal Rotating Images Section */}
            <section className="py-16 bg-white overflow-hidden">
                <div className="text-center mb-12 px-4">
                    <h2 className="text-2xl md:text-4xl font-black text-[#373081] mb-3">Our Presence on Ground</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Capturing moments of hope, support, and community service across our initiatives.</p>
                </div>

                <div className="relative flex overflow-hidden group">
                    <motion.div
                        className="flex gap-4 py-2 px-2"
                        animate={{
                            x: ["0%", "-33.33%"]
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 25,
                                ease: "linear",
                            }
                        }}
                    >
                        {carouselImages.map((img, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 w-64 md:w-80 h-44 md:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-50"
                            >
                                <img
                                    src={img}
                                    alt={`CSR Initiative ${idx}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        ))}
                    </motion.div>

                    {/* Gradient Overlays for smooth edges */}
                    <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                </div>
            </section>

            {/* Footer Call to Action */}
            {/* <section className="py-16 px-4 bg-slate-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100">
                        <Quote className="w-10 h-10 text-accent/20 mx-auto mb-6" />
                        <h3 className="text-xl md:text-2xl font-black text-[#373081] mb-6 leading-tight">
                            "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well."
                        </h3>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#373081] flex items-center justify-center text-white font-bold">JK</div>
                                <div className="text-left">
                                    <p className="font-bold text-[#373081]">Mr. J. K. Shah</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Founder, J. K. Shah Classes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </div>
    );
}

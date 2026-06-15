import React from "react";
import { RotateCcw, AlertCircle, HelpCircle, Ban, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export function RefundPolicyPage() {
    const points = [
        {
            title: "Subscription Terms",
            icon: DollarSign,
            content: "Please read the subscription terms and conditions carefully before subscribing to any of the subscription plans, as once you have subscribed you cannot change, cancel your subscription plan. Once you subscribe and make the required payment, it shall be final and there cannot be any changes or modifications to the same and neither will there be any refund."
        },
        {
            title: "No Refund Policy",
            icon: Ban,
            content: "Once you subscribe and make the required payment, it shall be final. JK Shah Classes does not offer any refunds or cancellations for any of our subscription plans under any circumstances."
        },
        {
            title: "Need Assistance?",
            icon: HelpCircle,
            content: "If you have any questions or concerns regarding your subscription, please please reach out to our support team at info@jkshah.com."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Header */}
            <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white pt-20 pb-10 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <RotateCcw className="w-16 h-16 mx-auto mb-6 opacity-80" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund Policy</h1>
                        {/* <p className="text-primary-foreground/80 text-lg">Last updated: January 28, 2026</p> */}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 -mt-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="grid md:grid-cols-1 gap-8">
                                {points.map((point, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow ${idx === 0 ? 'bg-primary/5 border-primary/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-white rounded-xl p-3 shadow-sm">
                                                <point.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <h2 className="text-xl font-bold text-foreground">{point.title}</h2>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-justify">{point.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

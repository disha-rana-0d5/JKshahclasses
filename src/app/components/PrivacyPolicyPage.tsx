import React from "react";
import { Shield, Lock, Eye, FileText, Mail, Info, Database, Cookie } from "lucide-react";
import { motion } from "framer-motion";

export function PrivacyPolicyPage() {
    const sections = [
        {
            title: "Our Commitment",
            icon: Info,
            content: "Your privacy is of great importance to us. As a user of this web site (the \"Site\"), you are valued by us and we will take appropriate measures to protect the information provided by and collected from you on the Site in connection with the functions, facilities, products and services offered on our Site. As our business changes and grows, so will this policy. Please check back periodically for additions and changes."
        },
        {
            title: "Information Collection & Use",
            icon: Database,
            content: "We only request and use information absolutely essential to respond to your requests for information on our services and to inform you of services we think may be of interest to you. Our site uses your IP address (an IP address identifies the type of browser you are using i.e. Netscape; Internet Explorer by assigning a unique number) for general system administration to serve you better by diagnosing problems with our server."
        },
        {
            title: "Personal Information",
            icon: Eye,
            content: "We will not collect any information about individuals, except where it is specifically and knowingly provided by them. Examples of such information are:",
            list: [
                "Your name",
                "Your mobile telephone number",
                "Your email address"
            ]
        },
        {
            title: "Electronic Mail & Forms",
            icon: Mail,
            content: "When you voluntarily send us electronic mail, we will keep a record of this information so that we can respond to you. We only collect information from you when you register on our site or fill out a form. Also, when filling out a form on our site, you may be asked to enter your: name, e-mail address or phone number. You may, however, visit our site anonymously. In case you have submitted your personal information and contact details, we reserve the rights to Call, SMS, Email or WhatsApp about our products and offers, even if your number has DND activated on it."
        },
        {
            title: "Data Sharing",
            icon: Lock,
            content: "The information collected will be used to send you the information you have requested and to provide information that may be useful to you. We may share non-personal aggregate statistics (group) data about our site visitors' traffic patterns with partners or other parties. However, we do not sell or share any information about individual users."
        },
        {
            title: "Cookies",
            icon: Cookie,
            content: "At times, we may use a feature of your browser to send your computer a \"cookie\". Cookies are used by thousands of web sites in order to enhance your web experience. A cookie is a small data file that assigns a unique anonymous number to your browser from a web server and is stored on your computer's hard drive. Cookies can not damage or read information stored on your hard drive. Cookies make your web experience more enjoyable by storing passwords and preferences. You can adjust your browser settings to refuse all cookies or to inform you when a cookie is being placed on your hard drive. However, your election not to accept cookies may diminish your experience with the Site because of additional time needed to repeatedly enter information."
        },
        {
            title: "Policy Changes & Security",
            icon: Shield,
            content: "Any changes to this policy will be posted here. J.K Shah Classes will maintain the confidentiality of the information it collects. We maintain internal practices that help protect the security and confidentiality of this information by limiting employee access to and use of this information."
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
                        <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        {/* <p className="text-primary-foreground/80 text-lg">Last updated: January 28, 2026</p> */}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 -mt-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12 space-y-12">
                            {sections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative pl-12"
                                >
                                    <div className="absolute left-0 top-0 bg-primary/10 rounded-xl p-2.5">
                                        <section.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
                                    <p className="text-slate-600 leading-relaxed mb-4 text-justify">{section.content}</p>
                                    {section.list && (
                                        <ul className="space-y-3">
                                            {section.list.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center text-slate-400 text-sm">
                        <p>If you have any questions regarding this policy, please email us at <a href="mailto:info@jkshah.com" className="text-primary hover:underline font-medium">info@jkshah.com</a></p>
                    </div>
                </div>
            </section>
        </div>
    );
}

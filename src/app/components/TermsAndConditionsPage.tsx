import React from "react";
import { FileText, UserCheck, ShieldCheck, AlertCircle, Scale, RefreshCw, Info, Globe, Lock, Share2, Copyright, Zap, HelpCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function TermsAndConditionsPage() {
    const sections = [
        {
            title: "1. Introduction",
            icon: Info,
            content: (
                <div className="space-y-4">
                    <p>Welcome to the JKSC terms and condition. These terms and conditions (“Terms and Conditions”), are between JKSC and you, (hereinafter referred to as “You” or “Your” or “User(s)”). By accessing our website www.jkshahclasses.com (“Website”), you agree to be bound by the provisions of these Terms and Conditions.</p>
                    <p>Please read these Terms and Conditions, along with the Privacy Policy and all other rules and policies made available or published on JKSC Website as they shall govern your use of the JKSC Website. By using or visiting the JKSC Website or any JKSC software, data feeds, and service provided to you on, from, or through the JKSC Website, you signify your agreement to (1) these “Terms and Conditions”, (2) JKSC’s Privacy Policy and any other terms that are updated from time to time. If you do not agree to any of these terms, please do not use the JKSC Website.</p>
                </div>
            )
        },
        {
            title: "2. About JKSC",
            icon: Globe,
            content: "The domain name, Website and the Apps are owned, registered and operated by JK Shah Classes Private Limited, a private company incorporated under the (Indian) Companies Act, 2013, and having its registered office at 4th Floor, Shraddha Old Nagardas Road, Andheri East, Mumbai 400 069, Maharastra, India, (hereinafter referred to as “JKSC” or “ us” or “we” or “our” or “Company”)."
        },
        {
            title: "3. JKSC Website",
            icon: ShieldCheck,
            list: [
                "These Terms and Conditions apply to all Users of the JKSC Website, including educators who are also contributors of User Content on the JKSC Website. The JKSC Website includes all aspects of the Website and Apps which includes but is not limited to products, software and service offered via the JKSC Website.",
                "JKSC Website is an online platform that supports and facilitates the online creation of educational videos/or tutorials and acts as an intermediary between the educator and the User.",
                "The JKSC Website may include or contain links to any third-party websites. JKSC has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites.",
                "JKSC hereby grants the you a non-exclusive, non-transferable, non-sublicensable, limited license to use the JKSC Website in accordance with these Terms and Conditions.",
                "JKSC shall have the right at any time to change or discontinue any aspect or feature of the JKSC Website, including, but not limited to, the User Content, hours of availability and equipment needed for access or use."
            ]
        },
        {
            title: "4. JKSC Accounts",
            icon: UserCheck,
            content: "In order to access some of the features of the JKSC Website, you may have to create your account with JKSC. You agree and confirm that you will never use another User’s account nor provide access to your account to any third-party. You are solely responsible for the activities that occur on your account, and you shall keep your account password secure. JKSC takes no responsibility for any User Content that is uploaded on the JKSC Website."
        },
        {
            title: "5. Access, Permissions and Restrictions",
            icon: Zap,
            list: [
                "You agree not to distribute in any medium any part of the JKSC Website or the content without JKSC’s prior written authorization.",
                "You agree not to alter or modify any part of the JKSC Website.",
                "You agree not to use the JKSC Website for any commercial uses (sale of access, sponsorships, etc.) unless you obtain JKSC’s prior written approval.",
                "You agree not to use or launch any automated system, including without limitation, “robots,” or “spiders.”",
                "You may post reviews, comments and other content, as long as the content is not illegal, obscene, or threatening."
            ]
        },
        {
            title: "6. Content Use & Intellectual Property",
            icon: Copyright,
            content: (
                <div className="space-y-4">
                    <p>JKSC Content utilized on the JKSC Website which shall include but not be limited to trademarks, service marks and logos (“Marks”), process, images, software, graphics are owned by or licensed to JKSC and subject to copyright and other intellectual property rights under the law.</p>
                    <p>The mark “ JKSC” is the sole property of JKSC. Reproduction in whole or in part of the same is strictly prohibited unless used with an express written permission from JKSC.</p>
                </div>
            )
        },
        {
            title: "7. Refunds & Cancellations",
            icon: RefreshCw,
            content: "Any refunds that are to be processed shall be processed in accordance with JKSC’s refund policy. Please read the subscription terms and conditions carefully before subscribing. Once you subscribe and make the required payment, it shall be final and there cannot be any changes or modifications to the same and neither will there be any refund."
        },
        {
            title: "8. Termination",
            icon: AlertCircle,
            content: "JKSC will terminate a User's access to the JKSC Website if the User is a repeat copyright infringer, breaches any terms of these Terms and Conditions, or violates any applicable laws. JKSC reserves the right to suspend access if we reasonably believe the account has been misused."
        },
        {
            title: "9. Governing Law",
            icon: Scale,
            content: "The Terms and Conditions are governed by and constructed in accordance with the laws of India, without reference to conflict of laws principles and you irrevocably and unconditionally submit to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India."
        },
        {
            title: "10. Confidentiality & Liability",
            icon: Lock,
            content: "You will not without obtaining prior written consent of JKSC, disclose to third party any Confidential Information. TO THE FULLEST EXTENT PERMITTED BY LAW, JKSC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS EXCLUDE ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE JKSC WEBSITE AND YOUR USE THEREOF."
        },
        {
            title: "11. Complaint Policy",
            icon: MessageSquare,
            content: (
                <div className="space-y-5">
                    <p>We are committed to providing a high quality learning experience. If you face any issues, please follow the steps below.</p>

                    <div>
                        <p className="font-semibold text-foreground mb-1">Step 1 — Raise a Complaint</p>
                        <p>Email us at <a href="mailto:karan.gandhi@jkshahclasses.com" className="text-primary hover:underline font-medium">karan.gandhi@jkshahclasses.com</a> with the following details:</p>
                        <ul className="mt-2 space-y-1 ml-4">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span>Your full name</span></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span>ACCA ID</span></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span>Batch details</span></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span>Issue description</span></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" /><span>Any supporting evidence</span></li>
                        </ul>
                        <p className="mt-2">We aim to respond within <strong>2 working days</strong> and resolve within <strong>7 working days</strong>.</p>
                    </div>

                    <div>
                        <p className="font-semibold text-foreground mb-1">Step 2 — Escalation</p>
                        <p>If your complaint remains unresolved, you may escalate it to the ACCA Vertical Head at <a href="mailto:cakaran@jkshahclasses.com" className="text-primary hover:underline font-medium">cakaran@jkshahclasses.com</a>.</p>
                    </div>

                    <div>
                        <p className="font-semibold text-foreground mb-1">Step 3 — Escalation to ACCA</p>
                        <p>Any student who wishes to make a complaint to ACCA will be advised to follow JKSC's complaint procedure first. If the complaint is not handled to their satisfaction, the student then has the option to escalate their complaint to ACCA. If a student has exhausted both JKSC's complaint process and ACCA's, they can escalate to the appropriate regulator, details of which can be found on the ACCA website at: <a href="https://www.accaglobal.com/gb/en/footer-toolbar/contact-us/unhappy.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">https://www.accaglobal.com/gb/en/footer-toolbar/contact-us/unhappy.html</a></p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="font-semibold text-foreground mb-2">Contact ACCA</p>
                        <p>ACCA Connect, 110 Queen Street, Glasgow G1 3BX, United Kingdom</p>
                        <p className="mt-1">T: <a href="tel:+441415822000" className="text-primary hover:underline">+44 (0)141 582 2000</a></p>
                        <p className="mt-1">E: <a href="https://forms.accaglobal.com/contact-us" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://forms.accaglobal.com/contact-us</a></p>
                        <p className="mt-1">W: <a href="https://www.accaglobal.com/gb/en/student.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.accaglobal.com/gb/en/student.html</a></p>
                    </div>
                </div>
            )
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
                        <FileText className="w-16 h-16 mx-auto mb-6 opacity-80" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
                        {/* <p className="text-primary-foreground/80 text-lg">As updated on January 23, 2020</p> */}
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
                                    <div className="text-slate-600 leading-relaxed mb-4 text-justify">
                                        {section.content}
                                    </div>
                                    {section.list && (
                                        <ul className="space-y-3">
                                            {section.list.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-600 text-justify">
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
                        <p>If you have any questions regarding these terms, please email us at <a href="mailto:info@jkshahclasses.com" className="text-primary hover:underline font-medium">info@jkshahclasses.com</a></p>
                    </div>
                </div>
            </section>
        </div>
    );
}

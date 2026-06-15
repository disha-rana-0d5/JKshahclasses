import { Phone, Mail, Instagram, Youtube, MessageSquarePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { landingPageApi } from "../api/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { EnquireNowForm } from "./forms/EnquireNowForm";

export function BottomContactStrip() {
    const [content, setContent] = useState<any>(null);
    const [branches, setBranches] = useState<string[]>([]);
    const [enquireOpen, setEnquireOpen] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { ok, data } = await landingPageApi.getLandingContent();
                if (ok && data.success) {
                    setContent(data.data.globalFooter || null);
                    const branchNames: string[] = (data.data.branches || [])
                        .map((b: any) => b.name)
                        .filter(Boolean);
                    setBranches(branchNames);
                }
            } catch (error) {
                console.error("Failed to load contact strip content");
            }
        };
        fetchContent();
    }, []);

    const phone = content?.contactInfo?.phone || "+91 9757111333";
    const email = content?.contactInfo?.email || "info@jkshah.com";

    const instagram = content?.socialLinks?.find((l: any) => l.platform === "Instagram")?.url || "https://www.instagram.com/officialjksc/?hl=en";
    const youtube = content?.socialLinks?.find((l: any) => l.platform === "YouTube")?.url || "https://www.youtube.com/@JKSC";
    const whatsapp = `https://wa.me/918657014669`;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary text-white py-1.5 px-3 md:px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.15)] select-none">
                <div className="max-w-7xl mx-auto flex justify-center items-center gap-2 md:gap-6 text-[10px] md:text-sm font-semibold">
                    {/* Contact Info */}
                    <div className="flex items-center gap-2 md:gap-6">
                        <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-white/80 transition-colors whitespace-nowrap">
                            <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 fill-white/10" />
                            <span>{phone}</span>
                        </a>
                        <a href={`mailto:${email}`} className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors whitespace-nowrap">
                            <Mail className="w-3.5 h-3.5 fill-white/10" />
                            <span>{email}</span>
                        </a>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform p-0.5 md:p-1">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 md:w-5 md:h-5 fill-white"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                        <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform p-0.5 md:p-1">
                            <Instagram className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        </a>
                        <a href={youtube} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform p-0.5 md:p-1">
                            <Youtube className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        </a>
                    </div>

                    {/* Enquire Now Button */}
                    <button
                        onClick={() => setEnquireOpen(true)}
                        className="flex items-center gap-1 bg-white text-primary font-bold px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap shadow"
                    >
                        <MessageSquarePlus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        Enquire Now
                    </button>
                </div>
            </div>

            {/* Enquire Now Modal */}
            <Dialog open={enquireOpen} onOpenChange={setEnquireOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-primary">Enquire Now</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Fill in your details and we'll get back to you shortly.
                        </p>
                    </DialogHeader>
                    <EnquireNowForm
                        branches={branches}
                        onSuccess={() => setEnquireOpen(false)}
                        className="mt-2"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

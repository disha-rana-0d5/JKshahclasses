import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface MerittoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MerittoFormModal({ isOpen, onClose }: MerittoFormModalProps) {
    const scriptInjected = useRef(false);

    useEffect(() => {
        if (isOpen && !scriptInjected.current) {
            // Find existing script or create new one
            let s = document.querySelector('script[src="https://widgets.in4.nopaperforms.com/emwgts.js"]') as HTMLScriptElement;
            if (!s) {
                s = document.createElement("script");
                s.type = "text/javascript";
                s.async = true;
                s.src = "https://widgets.in4.nopaperforms.com/emwgts.js";
                document.body.appendChild(s);
            } else {
                // If script exists but might need re-triggering, we can try to re-append it
                s.remove();
                const newScript = document.createElement("script");
                newScript.type = "text/javascript";
                newScript.async = true;
                newScript.src = "https://widgets.in4.nopaperforms.com/emwgts.js";
                document.body.appendChild(newScript);
            }
            scriptInjected.current = true;
        }
    }, [isOpen]);

    // Reset injection flag when closed so it re-injects on next open
    useEffect(() => {
        if (!isOpen) {
            scriptInjected.current = false;
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                {/* <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary">Enquire Now</DialogTitle>
                </DialogHeader> */}
                <div className="w-full min-h-[400px] flex items-center justify-center mt-4">
                    <div className="npf_wgts w-full" data-height="400px" data-w="c45343772967e388ad02ab7d99827e3a"></div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

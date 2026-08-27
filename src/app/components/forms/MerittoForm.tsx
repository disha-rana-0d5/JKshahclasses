import { useEffect, useRef } from "react";

export function MerittoForm() {
    const scriptInjected = useRef(false);

    useEffect(() => {
        if (!scriptInjected.current) {
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

        return () => {
            scriptInjected.current = false;
        };
    }, []);

    return (
        <div className="w-full min-h-[400px] flex items-center justify-center mt-4 bg-white/95 rounded-2xl">
            <div className="npf_wgts w-full" data-height="400px" data-w="c45343772967e388ad02ab7d99827e3a"></div>
        </div>
    );
}

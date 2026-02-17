"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const FB_PIXEL_ID = "1468671101342188";

function PixelEvents() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "PageView");
        }
    }, [pathname, searchParams]);

    return null;
}

export default function MetaPixel() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Load Pixel script
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

        (window as any).fbq("init", FB_PIXEL_ID);
        (window as any).fbq("track", "PageView");
    }, []);

    return (
        <Suspense fallback={null}>
            <PixelEvents />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </Suspense>
    );
}

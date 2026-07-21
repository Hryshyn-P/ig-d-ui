"use client";

import { useEffect } from "react";

const ADSENSE_SCRIPT_ID = "google-adsense-script";
const ADSENSE_SCRIPT_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4572528271560814";

export function AdSenseScript() {
  useEffect(() => {
    if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.src = ADSENSE_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}

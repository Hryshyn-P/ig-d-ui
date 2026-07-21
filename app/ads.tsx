"use client";

import Script from "next/script";
import { useConsent } from "./consent";

const socialBarSrc = normalizeScriptUrl(
  process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SRC,
);
const nativeScriptSrc = normalizeScriptUrl(
  process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SCRIPT_SRC,
);
const nativeContainerId = normalizeContainerId(
  process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CONTAINER_ID,
);

function normalizeScriptUrl(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate.startsWith("//") ? `https:${candidate}` : candidate);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function normalizeContainerId(value: string | undefined) {
  const candidate = value?.trim();
  return candidate && /^[A-Za-z][\w:-]*$/.test(candidate) ? candidate : null;
}

export function SocialBarAd() {
  const { preferences } = useConsent();
  if (!socialBarSrc || !preferences?.advertising) return null;

  return (
    <Script
      id="adsterra-social-bar"
      src={socialBarSrc}
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}

export function NativeBannerAd() {
  const { preferences } = useConsent();
  if (!nativeScriptSrc || !nativeContainerId || !preferences?.advertising) return null;

  return (
    <aside className="native-ad" aria-label="Advertisement">
      <span className="ad-label">ADVERTISEMENT</span>
      <div id={nativeContainerId} />
      <Script
        id="adsterra-native-banner"
        src={nativeScriptSrc}
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </aside>
  );
}

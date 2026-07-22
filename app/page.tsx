"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { NativeBannerAd, SocialBarAd } from "./ads";
import { ConsentProvider, ConsentSettingsButton } from "./consent";
import { ThemeToggle } from "./theme-toggle";

type MediaItem = {
  url: string;
  type?: "video" | "image" | "audio";
  quality?: string;
  filename?: string;
};

type DownloadMode = "all" | "reels" | "video" | "photo" | "dp" | "story" | "audio";
type InstagramInputKind = "username" | "profile" | "story" | "reel" | "post" | "tv";

const downloadModes: Array<{
  id: DownloadMode;
  label: string;
  icon: string;
  title: string;
  description: string;
  placeholder: string;
}> = [
  { id: "all", label: "All", icon: "⌕", title: "Instagram Downloader", description: "Download public Instagram Reels, videos, photos, stories, and audio in the best available quality.", placeholder: "Paste any Instagram link" },
  { id: "reels", label: "Reels", icon: "▻", title: "Instagram Reels Downloader", description: "Save public Instagram Reels in their highest available video quality.", placeholder: "Paste Instagram Reel link" },
  { id: "video", label: "Video", icon: "▹", title: "Instagram Video Downloader", description: "Download videos from public Instagram posts without installing an app.", placeholder: "Paste Instagram video link" },
  { id: "photo", label: "Photo", icon: "▧", title: "Instagram Photo Downloader", description: "Save photos and carousel images from public Instagram posts.", placeholder: "Paste Instagram photo link" },
  { id: "dp", label: "DP", icon: "♙", title: "Instagram Profile Picture Downloader", description: "Download the public profile picture for an Instagram account.", placeholder: "Paste profile link or enter @username" },
  { id: "story", label: "Story", icon: "◉", title: "Instagram Story Downloader", description: "Save currently available stories from public Instagram accounts.", placeholder: "Paste story/profile link or enter @username" },
  { id: "audio", label: "Audio", icon: "♫", title: "Instagram Audio Downloader", description: "Download the audio track made available by a public Instagram Reel.", placeholder: "Paste Instagram Reel link" },
];

type DownloadResult = {
  title?: string;
  thumbnail?: string;
  media: MediaItem[];
};

const API_URL = process.env.NEXT_PUBLIC_DOWNLOADER_API_URL?.trim();
const HEALTH_URL = (() => {
  if (!API_URL) return null;
  try {
    return new URL("/health", API_URL).href;
  } catch {
    return null;
  }
})();

function detectInstagramInputKind(value: string, allowUsername = true): InstagramInputKind | null {
  const input = value.trim();
  if (allowUsername && /^@?[A-Za-z0-9._]{1,30}$/.test(input)) return "username";
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:" || !["instagram.com", "www.instagram.com"].includes(parsed.hostname)) return null;
    const [first] = parsed.pathname.split("/").filter(Boolean);
    if (!first) return null;
    if (first === "stories") return "story";
    if (first === "reel" || first === "reels") return "reel";
    if (first === "p") return "post";
    if (first === "tv") return "tv";
    return /^[A-Za-z0-9._]{1,30}$/.test(first) ? "profile" : null;
  } catch {
    return null;
  }
}

function resolveDownloadMode(value: string, requestedMode: DownloadMode, allowUsername = true) {
  const kind = detectInstagramInputKind(value, allowUsername);
  if (!kind) return null;
  if (kind === "story") return { kind, mode: "story" as DownloadMode };
  if (kind === "username" || kind === "profile") {
    return { kind, mode: requestedMode === "story" ? "story" : "dp" as DownloadMode };
  }
  if (kind === "reel") {
    const compatible = (["reels", "video", "audio"] as DownloadMode[]).includes(requestedMode);
    return { kind, mode: compatible ? requestedMode : "reels" as DownloadMode };
  }
  if (kind === "tv") return { kind, mode: requestedMode === "audio" ? "audio" : "video" as DownloadMode };
  const compatible = (["all", "video", "photo", "audio"] as DownloadMode[]).includes(requestedMode);
  return { kind, mode: compatible ? requestedMode : "all" as DownloadMode };
}

const inputKindLabels: Record<InstagramInputKind, string> = {
  username: "Instagram profile",
  profile: "Instagram profile",
  story: "Instagram Story",
  reel: "Instagram Reel",
  post: "Instagram post",
  tv: "Instagram video",
};

function mediaForMode(media: MediaItem[], mode: DownloadMode) {
  if (mode === "photo" || mode === "dp") return media.filter((item) => item.type === "image");
  if (mode === "audio") return media.filter((item) => item.type === "audio");
  if (mode === "reels" || mode === "video") return media.filter((item) => item.type !== "image" && item.type !== "audio");
  return media;
}

function mediaDownloadUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.pathname === "/api/media") parsed.searchParams.set("download", "1");
    return parsed.href;
  } catch {
    return value;
  }
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" />
    </svg>
  );
}

function MediaPreview({ result }: { result: DownloadResult }) {
  const audio = result.media.find((item) => item.type === "audio");
  const previewItems = result.media.filter((item) => item.type !== "audio");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = previewItems[activeIndex];

  if (audio) {
    return <audio className="audio-preview" controls preload="metadata" src={audio.url}>Your browser does not support audio preview.</audio>;
  }

  if (!activeItem && !result.thumbnail) return null;

  return (
    <div className="preview-area">
      {activeItem?.type === "video" ? (
        <video
          key={`${activeIndex}-${activeItem.url}`}
          className="media-preview"
          controls
          playsInline
          preload="metadata"
          src={activeItem.url}
          poster={activeIndex === 0 ? result.thumbnail : undefined}
          aria-label={`Instagram video preview ${activeIndex + 1} of ${previewItems.length}`}
        >
          Your browser does not support video preview.
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="media-preview" src={activeItem?.url ?? result.thumbnail} alt={`Instagram image preview ${activeIndex + 1} of ${previewItems.length || 1}`} />
      )}
      {previewItems.length > 1 && (
        <div className="preview-picker" aria-label="Choose media preview">
          <span>Preview {activeIndex + 1} of {previewItems.length}</span>
          <div>
            {previewItems.map((item, index) => (
              <button
                key={item.url}
                className={index === activeIndex ? "active" : ""}
                type="button"
                aria-label={`Show preview ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >{index + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<DownloadMode>("all");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [detectedKind, setDetectedKind] = useState<InstagramInputKind | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "ready" | "unavailable">(
    HEALTH_URL ? "checking" : "unavailable",
  );
  const activeMode = downloadModes.find((item) => item.id === mode) ?? downloadModes[0];

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      window.scrollTo({ top: 0, left: 0 });
    }
  }, []);

  useEffect(() => {
    const updateScrollTop = () => setShowScrollTop(window.scrollY > 320);
    updateScrollTop();
    window.addEventListener("scroll", updateScrollTop, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollTop);
  }, []);

  useEffect(() => {
    if (!HEALTH_URL) return;

    const controller = new AbortController();
    fetch(HEALTH_URL, { cache: "no-store", signal: controller.signal })
      .then((response) => setBackendStatus(response.ok ? "ready" : "unavailable"))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setBackendStatus("unavailable");
        }
      });

    return () => controller.abort();
  }, []);

  function selectMode(nextMode: DownloadMode) {
    setMode(nextMode);
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  function applyInput(nextValue: string, allowUsername = false) {
    const trimmed = nextValue.trim();
    setUrl(trimmed);
    const detected = resolveDownloadMode(trimmed, mode, allowUsername);
    setDetectedKind(detected?.kind ?? null);
    if (detected && detected.mode !== mode) setMode(detected.mode);
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) applyInput(text, true);
    } catch {
      inputRef.current?.focus();
      setStatus("error");
      setMessage("Clipboard access is blocked. Touch and hold the field, then choose Paste.");
    }
  }

  function scrollToSection(id: string) {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
  }

  function scrollToTop() {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);

    const detected = resolveDownloadMode(url, mode, true);

    if (!detected) {
      setStatus("error");
      setMessage("Enter a valid Instagram link or username.");
      return;
    }
    const requestMode = detected.mode;
    const requestModeConfig = downloadModes.find((item) => item.id === requestMode) ?? downloadModes[0];
    setDetectedKind(detected.kind);
    if (requestMode !== mode) setMode(requestMode);

    if (!API_URL) {
      setStatus("error");
      setMessage("Downloads are temporarily unavailable. Please try again later.");
      return;
    }

    setStatus("loading");
    setMessage("Finding available media…");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), mode: requestMode }),
      });

      const data = (await response.json()) as DownloadResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "We could not process this URL.");
      setBackendStatus("ready");
      const media = Array.isArray(data.media) ? mediaForMode(data.media, requestMode) : [];
      if (media.length === 0) {
        throw new Error(`No downloadable ${requestMode === "all" ? "media" : requestModeConfig.label.toLowerCase()} was found.`);
      }

      setResult({ ...data, media });
      setStatus("success");
      setMessage("Ready — choose a file.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <ConsentProvider><main>
      <SocialBarAd />
      <button
        className={`scroll-top${showScrollTop ? " visible" : ""}`}
        type="button"
        aria-label="Scroll to top"
        title="Scroll to top"
        tabIndex={showScrollTop ? 0 : -1}
        onClick={scrollToTop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg>
      </button>
      <header className="site-header">
        <button className="brand brand-button" type="button" aria-label="ReelSave home" onClick={() => scrollToSection("top")}>
          <span className="brand-mark"><DownloadIcon /></span>
          Reel<span>Save</span>
        </button>
        <div className="header-actions">
          <nav aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection("how")}>How it works</button>
            <button type="button" onClick={() => scrollToSection("faq")}>FAQ</button>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <section className="hero" id="top">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <div className="eyebrow">FREE • HIGH QUALITY • NO SIGN-UP</div>
          <div className="mode-tabs" role="tablist" aria-label="Download type">
            {downloadModes.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={mode === item.id ? "active" : ""} onClick={() => selectMode(item.id)}>
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
          <h1>{activeMode.title.split(" ").slice(0, -1).join(" ")}<br /><em>{activeMode.title.split(" ").at(-1)}</em></h1>
          <p>{activeMode.description}</p>
        </div>

        <form className="download-card" onSubmit={submit} noValidate>
          <label htmlFor="instagram-url">{mode === "dp" || mode === "story" ? "Instagram profile or URL" : "Instagram URL"}</label>
          <div className="input-row">
            <div className="url-field">
              <input
                id="instagram-url"
                ref={inputRef}
                type="text"
                inputMode="url"
                placeholder={activeMode.placeholder}
                value={url}
                onChange={(event) => applyInput(event.target.value)}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text");
                  if (pasted) {
                    event.preventDefault();
                    applyInput(pasted, true);
                  }
                }}
                aria-describedby="form-note form-status"
                autoComplete="url"
              />
              <button className="paste-button" type="button" onClick={url ? () => applyInput("") : pasteFromClipboard}>
                {url ? "Clear" : "Paste"}
              </button>
            </div>
            <button type="submit" disabled={status === "loading"}>
              <DownloadIcon />
              {status === "loading" ? "Processing…" : `Download ${mode === "all" ? "media" : activeMode.label}`}
            </button>
          </div>
          <p id="form-note" className="form-note">
            100% free. Public Instagram posts only. No account required.
            {detectedKind && <span className="input-detected">Detected: {inputKindLabels[detectedKind]}.</span>}
            <span className={`backend-state ${backendStatus}`} aria-live="polite">
              {backendStatus === "checking" && "Preparing downloader…"}
              {backendStatus === "ready" && "Downloader ready."}
              {backendStatus === "unavailable" && "Downloader starts on first request."}
            </span>
          </p>
          {message && <div id="form-status" className={`status ${status}`} role="status">{message}</div>}

          {result && (
            <div className="results">
              <MediaPreview result={result} />
              <div className="result-list">
                <strong>{result.title || "Instagram media"}</strong>
                {result.media.map((item, index) => (
                  <a key={`${item.url}-${index}`} href={mediaDownloadUrl(item.url)} download={item.filename}>
                    <DownloadIcon />
                    Download {item.type === "image" ? "image" : item.type === "audio" ? "audio" : "video"} {item.quality && `• ${item.quality}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="trust-row">
          <span>✓ High-quality video</span><span>✓ Free to use</span><span>✓ No Instagram login</span>
        </div>
      </section>

      <NativeBannerAd />

      <section className="section" id="how">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>How to download an Instagram video</h2>
          <p>Save a public Reel or post video in its highest available quality.</p>
        </div>
        <div className="steps">
          <article><b>01</b><div className="step-icon">↗</div><h3>Copy the Instagram link</h3><p>Open a public Reel or post on Instagram and select “Copy link”.</p></article>
          <article><b>02</b><div className="step-icon">⌁</div><h3>Paste the link</h3><p>Paste the Instagram URL into the downloader above and press the button.</p></article>
          <article><b>03</b><div className="step-icon">↓</div><h3>Download the video</h3><p>Select an available video and save it to your phone or computer.</p></article>
        </div>
      </section>

      <section className="content-grid">
        <div className="benefits">
          <span className="kicker">INSTAGRAM VIDEO DOWNLOADER</span>
          <h2>Free and simple to use</h2>
          <ul>
            <li><i>⚡</i><div><strong>High-quality video downloads</strong><p>Save supported Instagram videos in the highest quality available from the source.</p></div></li>
            <li><i>◇</i><div><strong>Works in your browser</strong><p>Use it on a phone, tablet, or computer without installing an app.</p></div></li>
            <li><i>◎</i><div><strong>No Instagram account needed</strong><p>Paste a public link without sharing your Instagram login or password.</p></div></li>
          </ul>
        </div>
      </section>

      <section className="section faq" id="faq">
        <div className="section-heading"><span>FAQ</span><h2>Instagram video downloader FAQ</h2></div>
        <details><summary>Can I download from private accounts?</summary><p>No. ReelSave only processes public media and will never ask for your login or password.</p></details>
        <details><summary>Where is the downloaded file saved?</summary><p>In your browser’s default downloads folder. This website does not store the file.</p></details>
        <details><summary>Is this Instagram video downloader free?</summary><p>Yes. ReelSave is free to use. The page may display ads to support the service.</p></details>
        <details><summary>Can I download Instagram videos in HD?</summary><p>ReelSave provides the highest video quality available from the public Instagram post, including HD when the source provides it.</p></details>
        <details><summary>What content can I download?</summary><p>Only your own media or content you have permission from the copyright owner to download and use.</p></details>
      </section>

      <footer>
        <button className="brand brand-button footer-brand" type="button" onClick={() => scrollToSection("top")}><span className="brand-mark"><DownloadIcon /></span>Reel<span>Save</span></button>
        <p>Download videos from public Instagram Reels and posts for free in the highest available quality. ReelSave is not affiliated with Instagram or Meta.</p>
        <div><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><ConsentSettingsButton /></div>
        <small>© {new Date().getFullYear()} ReelSave</small>
      </footer>
    </main></ConsentProvider>
  );
}

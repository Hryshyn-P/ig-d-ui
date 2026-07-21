"use client";

import { FormEvent, useState } from "react";
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

function isInstagramInput(value: string, mode: DownloadMode) {
  if ((mode === "dp" || mode === "story") && /^@?[A-Za-z0-9._]{1,30}$/.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["instagram.com", "www.instagram.com"].includes(url.hostname)) return false;
    if (mode === "dp") return /^\/[A-Za-z0-9._]+\/?$/.test(url.pathname);
    if (mode === "story") return /^\/(stories\/|[A-Za-z0-9._]+\/?$)/.test(url.pathname);
    return /^\/(reel|reels|p|tv)\//.test(url.pathname);
  } catch {
    return false;
  }
}

function mediaForMode(media: MediaItem[], mode: DownloadMode) {
  if (mode === "photo" || mode === "dp") return media.filter((item) => item.type === "image");
  if (mode === "audio") return media.filter((item) => item.type === "audio");
  if (mode === "reels" || mode === "video") return media.filter((item) => item.type !== "image" && item.type !== "audio");
  return media;
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
  const video = result.media.find((item) => item.type !== "image");

  if (audio) {
    return <audio className="audio-preview" controls preload="metadata" src={audio.url}>Your browser does not support audio preview.</audio>;
  }

  if (video) {
    return (
      <video
        className="media-preview"
        controls
        playsInline
        preload="metadata"
        poster={result.thumbnail}
        aria-label="Instagram video preview"
      >
        <source src={video.url} />
        Your browser does not support video preview.
      </video>
    );
  }

  if (result.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="media-preview" src={result.thumbnail} alt="Instagram post preview" />;
  }

  return null;
}

export default function Home() {
  const [mode, setMode] = useState<DownloadMode>("all");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const activeMode = downloadModes.find((item) => item.id === mode) ?? downloadModes[0];

  function selectMode(nextMode: DownloadMode) {
    setMode(nextMode);
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) setUrl(text.trim());
    } catch {
      setStatus("error");
      setMessage("Clipboard access was blocked. Paste the link manually.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);

    if (!isInstagramInput(url.trim(), mode)) {
      setStatus("error");
      setMessage(mode === "dp" || mode === "story" ? "Enter a valid Instagram profile, story link, or username." : "Enter a valid Instagram post or Reel URL.");
      return;
    }

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
        body: JSON.stringify({ url: url.trim(), mode }),
      });

      const data = (await response.json()) as DownloadResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "We could not process this URL.");
      const media = Array.isArray(data.media) ? mediaForMode(data.media, mode) : [];
      if (media.length === 0) {
        throw new Error(`No downloadable ${mode === "all" ? "media" : activeMode.label.toLowerCase()} was found.`);
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
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ReelSave home">
          <span className="brand-mark"><DownloadIcon /></span>
          Reel<span>Save</span>
        </a>
        <div className="header-actions">
          <nav aria-label="Main navigation">
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
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
                type="text"
                inputMode="url"
                placeholder={activeMode.placeholder}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-describedby="form-note form-status"
                autoComplete="url"
              />
              <button className="paste-button" type="button" onClick={url ? () => setUrl("") : pasteFromClipboard}>
                {url ? "Clear" : "Paste"}
              </button>
            </div>
            <button type="submit" disabled={status === "loading"}>
              <DownloadIcon />
              {status === "loading" ? "Processing…" : `Download ${mode === "all" ? "media" : activeMode.label}`}
            </button>
          </div>
          <p id="form-note" className="form-note">100% free. Public Instagram posts only. No account required.</p>
          {message && <div id="form-status" className={`status ${status}`} role="status">{message}</div>}

          {result && (
            <div className="results">
              <MediaPreview result={result} />
              <div className="result-list">
                <strong>{result.title || "Instagram media"}</strong>
                {result.media.map((item, index) => (
                  <a key={`${item.url}-${index}`} href={item.url} download={item.filename} target="_blank" rel="noreferrer">
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
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><DownloadIcon /></span>Reel<span>Save</span></a>
        <p>Download videos from public Instagram Reels and posts for free in the highest available quality. ReelSave is not affiliated with Instagram or Meta.</p>
        <div><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><ConsentSettingsButton /></div>
        <small>© {new Date().getFullYear()} ReelSave</small>
      </footer>
    </main></ConsentProvider>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { NativeBannerAd, SocialBarAd } from "./ads";

type MediaItem = {
  url: string;
  type?: "video" | "image";
  quality?: string;
  filename?: string;
};

type DownloadResult = {
  title?: string;
  thumbnail?: string;
  media: MediaItem[];
};

const API_URL = process.env.NEXT_PUBLIC_DOWNLOADER_API_URL?.trim();

function isInstagramUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["instagram.com", "www.instagram.com"].includes(url.hostname) &&
      /^\/(reel|reels|p|tv)\//.test(url.pathname)
    );
  } catch {
    return false;
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
  const video = result.media.find((item) => item.type !== "image");

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
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);

    if (!isInstagramUrl(url.trim())) {
      setStatus("error");
      setMessage("Enter a valid Instagram post, Reel, or IGTV URL.");
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
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await response.json()) as DownloadResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "We could not process this URL.");
      if (!Array.isArray(data.media) || data.media.length === 0) {
        throw new Error("No downloadable media was found in this post.");
      }

      setResult(data);
      setStatus("success");
      setMessage("Ready — choose a file.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main>
      <SocialBarAd />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ReelSave home">
          <span className="brand-mark"><DownloadIcon /></span>
          Reel<span>Save</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <div className="eyebrow">FREE • HIGH QUALITY • NO SIGN-UP</div>
          <h1>Free Instagram<br /><em>Video Downloader</em></h1>
          <p>Download Instagram Reels and post videos in the highest available quality. Paste a public Instagram link and save the video to your device for free.</p>
        </div>

        <form className="download-card" onSubmit={submit} noValidate>
          <label htmlFor="instagram-url">Instagram URL</label>
          <div className="input-row">
            <input
              id="instagram-url"
              type="url"
              inputMode="url"
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              aria-describedby="form-note form-status"
              autoComplete="url"
            />
            <button type="submit" disabled={status === "loading"}>
              <DownloadIcon />
              {status === "loading" ? "Processing…" : "Download Video in High Quality"}
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
                    Download {item.type === "image" ? "image" : "video"} {item.quality && `• ${item.quality}`}
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
        <div><a href="#faq">Terms</a><a href="#faq">Privacy</a></div>
        <small>© {new Date().getFullYear()} ReelSave</small>
      </footer>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";

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

function AdSlot({ size }: { size: string }) {
  return (
    <aside className="ad-slot" aria-label="Advertisement" data-ad-slot={size}>
      <span>ADVERTISEMENT</span>
      <small>{size}</small>
    </aside>
  );
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
      setMessage("The interface is ready. Connect a backend API to enable downloads.");
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
          <div className="eyebrow">FAST • PRIVATE • NO SIGN-UP</div>
          <h1>Instagram media.<br /><em>Saved cleanly.</em></h1>
          <p>Paste a public Reel or post URL and save the available media in its original quality.</p>
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
              {status === "loading" ? "Processing…" : "Download"}
            </button>
          </div>
          <p id="form-note" className="form-note">Public posts only. No login required.</p>
          {message && <div id="form-status" className={`status ${status}`} role="status">{message}</div>}

          {result && (
            <div className="results">
              {/* Remote preview hosts are determined by the configured downloader API. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {result.thumbnail && <img src={result.thumbnail} alt="Post preview" />}
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
          <span>✓ No installation</span><span>✓ Works everywhere</span><span>✓ No file storage</span>
        </div>
      </section>

      <AdSlot size="leaderboard-top" />

      <section className="section" id="how">
        <div className="section-heading">
          <span>THREE STEPS</span>
          <h2>From link to file</h2>
          <p>Done in under a minute.</p>
        </div>
        <div className="steps">
          <article><b>01</b><div className="step-icon">↗</div><h3>Copy the link</h3><p>Open the Instagram post and choose “Copy link”.</p></article>
          <article><b>02</b><div className="step-icon">⌁</div><h3>Paste it here</h3><p>Drop the URL into the field above and press Download.</p></article>
          <article><b>03</b><div className="step-icon">↓</div><h3>Save the file</h3><p>Choose the format you want and save it to your device.</p></article>
        </div>
      </section>

      <section className="content-grid">
        <div className="benefits">
          <span className="kicker">WHY REELSAVE</span>
          <h2>Nothing in the way</h2>
          <ul>
            <li><i>⚡</i><div><strong>Fast by design</strong><p>The shortest path from a link to your file.</p></div></li>
            <li><i>◇</i><div><strong>Built for every screen</strong><p>Phone, tablet, or desktop — no app required.</p></div></li>
            <li><i>◎</i><div><strong>Privacy first</strong><p>Your links and downloaded files are never stored here.</p></div></li>
          </ul>
        </div>
        <AdSlot size="rectangle-sidebar" />
      </section>

      <section className="section faq" id="faq">
        <div className="section-heading"><span>FAQ</span><h2>Good to know</h2></div>
        <details><summary>Can I download from private accounts?</summary><p>No. ReelSave only processes public media and will never ask for your login or password.</p></details>
        <details><summary>Where is the downloaded file saved?</summary><p>In your browser’s default downloads folder. This website does not store the file.</p></details>
        <details><summary>Is ReelSave free?</summary><p>Yes. The page may display ads to support the service.</p></details>
        <details><summary>What content can I download?</summary><p>Only your own media or content you have permission from the copyright owner to download and use.</p></details>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><DownloadIcon /></span>Reel<span>Save</span></a>
        <p>A tool for saving content available to you. ReelSave is not affiliated with Instagram or Meta.</p>
        <div><a href="#faq">Terms</a><a href="#faq">Privacy</a></div>
        <small>© {new Date().getFullYear()} ReelSave</small>
      </footer>
    </main>
  );
}

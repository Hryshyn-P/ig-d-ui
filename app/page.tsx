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
    <aside className="ad-slot" aria-label="Рекламный блок" data-ad-slot={size}>
      <span>РЕКЛАМА</span>
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
      setMessage("Вставьте корректную ссылку на публикацию, Reel или IGTV в Instagram.");
      return;
    }

    if (!API_URL) {
      setStatus("error");
      setMessage("Интерфейс готов. Для скачивания владелец сайта должен подключить backend API.");
      return;
    }

    setStatus("loading");
    setMessage("Получаем доступные файлы…");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = (await response.json()) as DownloadResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось обработать ссылку.");
      if (!Array.isArray(data.media) || data.media.length === 0) {
        throw new Error("В публикации не найдено доступных файлов.");
      }

      setResult(data);
      setStatus("success");
      setMessage("Готово — выберите файл.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Что-то пошло не так. Попробуйте ещё раз.");
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ReelSave — на главную">
          <span className="brand-mark"><DownloadIcon /></span>
          Reel<span>Save</span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#how">Как скачать</a>
          <a href="#faq">Вопросы</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="hero-copy">
          <div className="eyebrow">Быстро • Просто • Без регистрации</div>
          <h1>Скачивайте видео<br />из Instagram</h1>
          <p>Вставьте ссылку на Reel или публикацию и сохраните доступный файл в исходном качестве.</p>
        </div>

        <form className="download-card" onSubmit={submit} noValidate>
          <label htmlFor="instagram-url">Ссылка на публикацию</label>
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
              {status === "loading" ? "Обработка…" : "Скачать"}
            </button>
          </div>
          <p id="form-note" className="form-note">Работает только с общедоступными публикациями.</p>
          {message && <div id="form-status" className={`status ${status}`} role="status">{message}</div>}

          {result && (
            <div className="results">
              {/* Remote preview hosts are determined by the configured downloader API. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {result.thumbnail && <img src={result.thumbnail} alt="Превью публикации" />}
              <div className="result-list">
                <strong>{result.title || "Instagram media"}</strong>
                {result.media.map((item, index) => (
                  <a key={`${item.url}-${index}`} href={item.url} download={item.filename} target="_blank" rel="noreferrer">
                    <DownloadIcon />
                    Скачать {item.type === "image" ? "изображение" : "видео"} {item.quality && `• ${item.quality}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="trust-row">
          <span>✓ Без установки</span><span>✓ Адаптивно</span><span>✓ Без хранения файлов</span>
        </div>
      </section>

      <AdSlot size="leaderboard-top" />

      <section className="section" id="how">
        <div className="section-heading">
          <span>ТРИ ШАГА</span>
          <h2>Как скачать видео</h2>
          <p>Всё занимает меньше минуты.</p>
        </div>
        <div className="steps">
          <article><b>01</b><div className="step-icon">↗</div><h3>Скопируйте ссылку</h3><p>Откройте публикацию в Instagram и выберите «Копировать ссылку».</p></article>
          <article><b>02</b><div className="step-icon">⌁</div><h3>Вставьте её</h3><p>Вернитесь сюда, вставьте адрес в поле выше и нажмите «Скачать».</p></article>
          <article><b>03</b><div className="step-icon">↓</div><h3>Сохраните файл</h3><p>Выберите нужный вариант и сохраните его на своё устройство.</p></article>
        </div>
      </section>

      <section className="content-grid">
        <div className="benefits">
          <span className="kicker">ПОЧЕМУ REELSAVE</span>
          <h2>Ничего лишнего</h2>
          <ul>
            <li><i>⚡</i><div><strong>Быстрая обработка</strong><p>Минимум действий от ссылки до файла.</p></div></li>
            <li><i>◇</i><div><strong>Работает на любом устройстве</strong><p>Телефон, планшет или обычный компьютер.</p></div></li>
            <li><i>◎</i><div><strong>Конфиденциальность</strong><p>Сайт не хранит ссылки и скачанные файлы.</p></div></li>
          </ul>
        </div>
        <AdSlot size="rectangle-sidebar" />
      </section>

      <section className="section faq" id="faq">
        <div className="section-heading"><span>FAQ</span><h2>Частые вопросы</h2></div>
        <details><summary>Можно ли скачивать видео из закрытых аккаунтов?</summary><p>Нет. Сервис обрабатывает только общедоступные материалы и не запрашивает логин или пароль.</p></details>
        <details><summary>Где сохраняется скачанный файл?</summary><p>В стандартную папку загрузок вашего браузера. Сам сайт файл не хранит.</p></details>
        <details><summary>Это бесплатно?</summary><p>Да. Для поддержки проекта на странице могут показываться рекламные объявления.</p></details>
        <details><summary>Какие публикации можно скачивать?</summary><p>Только собственные материалы либо контент, на скачивание и использование которого у вас есть разрешение правообладателя.</p></details>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><DownloadIcon /></span>Reel<span>Save</span></a>
        <p>Инструмент для сохранения доступного вам контента. Мы не связаны с Instagram или Meta.</p>
        <div><a href="#faq">Условия использования</a><a href="#faq">Конфиденциальность</a></div>
        <small>© {new Date().getFullYear()} ReelSave</small>
      </footer>
    </main>
  );
}

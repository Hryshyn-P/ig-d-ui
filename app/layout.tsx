import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelSave — скачать видео из Instagram",
  description: "Простой адаптивный интерфейс для сохранения общедоступных Instagram Reels и публикаций.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}

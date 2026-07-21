"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "reelsave-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("reelsave:theme", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("reelsave:theme", callback);
  };
}

export function ThemeToggle() {
  const storedTheme = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY),
    () => "dark",
  );
  const theme: Theme = storedTheme === "light" ? "light" : "dark";

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new CustomEvent("reelsave:theme"));
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">{theme === "dark" ? "☾" : "☀"}</span>
      </span>
    </button>
  );
}

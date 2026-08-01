"use client";

import { useState } from "react";

/*
 * Flips the data-theme attribute on <html>. Deliberately unpersisted:
 * theme preference is user state, and user state waits for the storage
 * abstraction (SRD §8). Until then the toggle lasts for the page visit.
 */
export function ThemeToggle() {
  const [label, setLabel] = useState("Theme");

  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    setLabel(next === "dark" ? "Light" : "Dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="rounded-md border border-rule px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}

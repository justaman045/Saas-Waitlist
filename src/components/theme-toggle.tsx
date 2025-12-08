"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium
                 bg-background/60 backdrop-blur shadow-sm hover:bg-accent"
    >
      <span>{isDark ? "☀️ Light" : "🌙 Dark"}</span>
    </button>
  );
}

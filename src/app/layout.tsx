import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Waitlist Studio",
  description: "Create beautiful waitlists for all your products in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {/* Top nav */}
            <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-20">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href={'/'}>
                  <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 shadow" />
                  <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-200 bg-clip-text text-sm font-semibold text-transparent">
                    Waitlist Studio
                  </span>
                </div>
                </Link>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href="/dashboard"
                    className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/5"
                  >
                    Dashboard
                  </a>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="border-t border-white/10 bg-black/40">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-slate-400">
                <span>© {new Date().getFullYear()} Waitlist Studio</span>
                <span>Built by you · Reusable for all your SaaS ideas</span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

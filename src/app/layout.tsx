import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicNavbar } from "@/components/dynamic-navbar";
import Link from "next/link";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://projektnotify.com"),
  title: {
    default: "Projekt Notify | Modern Waitlist Architecture",
    template: "%s | Projekt Notify",
  },
  description: "Create beautiful, high-performance waitlists for all your products in one place. Secured by Firebase, powered by Next.js 16.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider>
          {/* FLOATING DYNAMIC NAVBAR */}
          <DynamicNavbar />

          {/* MAIN CONTENT */}
          <main className="flex-1">{children}</main>

          {/* GLOBAL FOOTER - REINFORCED */}
          <footer className="border-t border-card-border bg-card/30 backdrop-blur-sm mt-auto z-10 relative">
            <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-6">

              <div className="flex flex-col gap-2 text-center md:text-left">
                <div className="text-xs font-bold text-foreground">PROJEKT NOTIFY SYSTEM</div>
                <div className="text-[10px] text-foreground/40 font-mono">
                  © {new Date().getFullYear()} All systems operational.
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-foreground/60">
                <Link href="/privacy" className="hover:text-amber-400 transition-colors hover:underline underline-offset-4">Privacy Node</Link>
                <Link href="/terms" className="hover:text-amber-400 transition-colors hover:underline underline-offset-4">Terms & Protocols</Link>
                <Link href="https://github.com/justaman045" target="_blank" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>Github</span>
                  <span className="text-xs">↗</span>
                </Link>
              </div>

            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projekt Notify",
  description: "Create beautiful waitlists for all your products in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-accent-sky/30">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            {/* Unified Modern Header */}
            <header className="fixed top-0 w-full z-[100] border-b border-white/5 glass px-4 py-3">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href={'/'}>
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-sky to-accent-emerald flex items-center justify-center font-bold text-black shadow-lg shadow-accent-sky/20 group-hover:scale-110 transition-transform">
                      P
                    </div>
                    <span className="font-semibold tracking-tight text-white/90 hidden sm:block">Projekt Notify</span>
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <a href="/admin" className="text-white/60 hover:text-white transition-colors">Admin</a>

                  <div className="h-4 w-[1px] bg-white/10" />

                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link href="/public" className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="border-t border-white/5 glass py-12">
              <div className="max-w-7xl mx-auto px-6 pt-16 border-t border-card-border">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-xl font-black tracking-tighter text-foreground">PROJEKT<span className="text-accent-sky">.</span></span>
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">© 2024 Modern SaaS Architecture</span>
                  </div>

                  <div className="flex items-center gap-12">
                    <Link href={"https://github.com/justaman045"} target="_blank" className="text-[10px] font-bold text-foreground/40 hover:text-accent-sky tracking-[0.2em] transition-colors uppercase">GITHUB</Link>
                    <Link href={"https://justaman045.vercel.app"} target="_blank" className="text-[10px] font-bold text-foreground/40 hover:text-accent-sky tracking-[0.2em] transition-colors uppercase">Developed by Aman</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function DynamicNavbar() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    return (
        <div className={`fixed z-50 flex justify-center pointer-events-none transition-all duration-300 left-0 right-0
      top-4 px-4 
      md:top-0 md:px-0
    `}>
            <nav className={`
        pointer-events-auto animate-slide-up 
        flex items-center justify-between 
        bg-background/60 backdrop-blur-xl border-white/10 dark:border-white/5 ring-1 ring-black/5 shadow-sm
        
        /* MOBILE: Floating Pill */
        w-full rounded-full p-2 pl-4 pr-2 border shadow-2xl

        /* DESKTOP: Full Width Bar with Centered Content */
        md:w-full md:rounded-none md:border-b md:border-x-0 md:border-t-0 md:shadow-none md:h-20 md:px-0
      `}>

                {/* INNER CONTAINER FOR DESKTOP ALIGNMENT */}
                <div className="w-full md:max-w-7xl md:mx-auto md:px-6 flex items-center justify-between">

                    {/* BRANDING */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/" className="font-black tracking-tighter text-sm md:text-xl text-foreground flex items-center gap-2 hover:opacity-80 transition-opacity">
                            {isAdmin ? (
                                <>
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </div>
                                    <span className="tracking-widest font-bold text-xs md:text-sm">MISSION CONTROL</span>
                                </>
                            ) : (
                                <>
                                    PROJEKT NOTIFY
                                    <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-500">BETA</span>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* NAVIGATION LINKS */}
                    <div className="flex items-center gap-4 shrink-0">
                        {isAdmin ? (
                            // ADMIN VIEW
                            <>
                                <Link href="/" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
                                    View Site
                                </Link>
                                <div className="h-4 w-px bg-foreground/10" />
                                <Link href="/admin" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            // PUBLIC VIEW
                            <>
                                <Link href="/public" className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all hidden sm:block">
                                    Pipeline
                                </Link>
                                <Link href="/login" className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] transition-all shadow-xl shadow-foreground/10 active:scale-95">
                                    Login
                                </Link>
                            </>
                        )}

                        <div className="pl-2 border-l border-foreground/10 ml-2">
                            <ThemeToggle />
                        </div>
                    </div>

                </div>
            </nav>
        </div>
    );
}

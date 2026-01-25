import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-accent-sky/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-accent-violent/5 rounded-full blur-[140px]" />
            </div>

            <div className="text-center animate-fade-in">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-accent-sky/20 blur-3xl rounded-full animate-pulse" />
                    <h1 className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 tracking-tighter">
                        404
                    </h1>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight">
                    Signal Lost in the <span className="text-accent-sky">Void</span>
                </h2>

                <p className="text-foreground/60 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
                    The node you are looking for has been decommissioned or never existed in this dimension.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl shadow-foreground/10"
                >
                    <span>Return to Command</span>
                </Link>
            </div>
        </div>
    );
}

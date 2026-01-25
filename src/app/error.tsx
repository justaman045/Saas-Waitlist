"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="glass p-12 rounded-[3rem] text-center max-w-lg border-red-500/10 shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mx-auto mb-8 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] animate-bounce">
                    ⚠️
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                    System Critical <span className="text-red-500">Failure</span>
                </h2>

                <p className="text-foreground/60 mb-8 text-sm leading-relaxed">
                    An unexpected anomaly was detected in the operational matrix. Our engineers have been notified.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-8 py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                    >
                        Retry Sequence
                    </button>
                </div>

                <p className="mt-8 text-[10px] text-foreground/20 font-mono uppercase tracking-widest">
                    Error Code: {error.digest || "UNKNOWN_EXCEPTION"}
                </p>
            </div>
        </div>
    );
}

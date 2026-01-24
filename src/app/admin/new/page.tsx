"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function NewProjectPage() {
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [desc, setDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ----- AUTH GUARD -----
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/login");
                return;
            }

            const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (allowedEmail && user.email !== allowedEmail) {
                signOut(auth);
                router.replace("/login");
                return;
            }

            setUserEmail(user.email ?? null);
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, [router]);

    // ----- AUTO SLUG GENERATION & UNIQUENESS CHECK -----
    useEffect(() => {
        if (!name.trim()) {
            setSlug("");
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingSlug(true);
            const baseSlug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");

            try {
                let finalSlug = baseSlug;
                let isUnique = false;
                let attempt = 0;

                while (!isUnique && attempt < 5) {
                    const q = query(collection(db, "projects"), where("slug", "==", finalSlug));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        isUnique = true;
                    } else {
                        // Append random 4-char string for uniqueness
                        const random = Math.random().toString(36).substring(2, 6);
                        finalSlug = `${baseSlug}-${random}`;
                        attempt++;
                    }
                }
                setSlug(finalSlug);
            } catch (err) {
                console.error("Slug check failed:", err);
            } finally {
                setIsCheckingSlug(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [name]);

    // ----- CREATE PROJECT -----
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCheckingSlug) return;

        setError(null);
        setSaving(true);

        try {
            await addDoc(collection(db, "projects"), {
                name,
                slug,
                short_description: desc,
                is_active: true,
                created_at: serverTimestamp(),
            });

            router.push("/admin");
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <div className="glass p-8 rounded-3xl animate-pulse text-foreground/50 text-sm tracking-widest uppercase">
                    Initializing Forge...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 px-6 bg-background">
            <div className="max-w-2xl mx-auto animate-fade-in">

                {/* HEADER */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push("/admin")}
                        className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mb-6"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Abort and Return
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 flex items-center justify-center text-2xl shadow-inner border border-accent-emerald/20">
                            🔥
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Project Forge</h1>
                            <p className="text-foreground/40 text-xs font-light italic">Dimensional instantiation of a new project node.</p>
                        </div>
                    </div>
                </div>

                {/* FORGE FORM */}
                <section className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent-emerald/5 blur-[60px] pointer-events-none" />

                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground/20 ml-1">Node Identity</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-foreground focus:border-accent-emerald/40 focus:bg-white/10 outline-none transition-all placeholder:text-foreground/10"
                                placeholder="e.g. Quantum Analytics Studio"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground/20 ml-1">Access Slug</label>
                            <div className="relative">
                                <input
                                    readOnly
                                    value={slug}
                                    className={`w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm font-mono transition-all ${isCheckingSlug ? 'text-foreground/20 border-accent-sky/20' : 'text-accent-emerald/80'}`}
                                    placeholder={isCheckingSlug ? "Generating Unique Key..." : "quantum-analytics"}
                                />
                                {isCheckingSlug && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-accent-sky/20 border-t-accent-sky rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[9px] text-foreground/20 ml-1 italic font-light">
                                {isCheckingSlug ? "Validating uniqueness across cloud nodes..." : <>Node will be accessible at <span className="text-accent-emerald/60">/p/{slug || "..."}</span></>}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-foreground/20 ml-1">Mission Intelligence</label>
                            <textarea
                                rows={5}
                                required
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-foreground focus:border-accent-emerald/40 focus:bg-white/10 outline-none transition-all resize-none font-light leading-relaxed"
                                placeholder="Describe the objective and core vision of this deployment unit..."
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                ⚠️ Initialisation Failed: {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full rounded-[2rem] bg-accent-emerald py-5 text-xs font-black uppercase tracking-[0.4em] text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-accent-emerald/20 disabled:opacity-50 border-b-4 border-black/20"
                            >
                                {saving ? "Instantiating..." : "Initiate Unit Deployment"}
                            </button>
                            <p className="text-center text-[9px] text-foreground/20 mt-4 font-medium uppercase tracking-[0.1em]">
                                Warning: This action will broadcast the node to the public network.
                            </p>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";

type Subscriber = {
    id: string;
    name: string;
    email: string;
    project_name: string;
    project_slug: string;
    source_url: string;
    utm_source: string | null;
    created_at: any;
};

type Project = {
    id: string;
    name: string;
    slug: string;
};

export default function SubscribersDashboard() {
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterProject, setFilterProject] = useState<string>("all");

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
            setAuthChecked(true);
        });
        return () => unsubscribe();
    }, [router]);

    // ----- LOAD DATA -----
    useEffect(() => {
        if (!authChecked) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Load Projects for filter
                const projSnap = await getDocs(collection(db, "projects"));
                const projData = projSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name, slug: doc.data().slug }));
                setProjects(projData);

                // Load Subscribers
                let q = query(collection(db, "waitlist_entries"), orderBy("created_at", "desc"));
                if (filterProject !== "all") {
                    q = query(collection(db, "waitlist_entries"), where("project_id", "==", filterProject), orderBy("created_at", "desc"));
                }

                const subSnap = await getDocs(q);
                const subData = subSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Subscriber[];

                setSubscribers(subData);
            } catch (err) {
                console.error("Error loading subscribers:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [authChecked, filterProject]);

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <div className="glass p-8 rounded-3xl animate-pulse text-foreground/50 text-sm tracking-widest uppercase">
                    Accessing Intel Stream...
                </div>
            </div>
        );
    }

    // Basic Analytics
    const sourceStats = subscribers.reduce((acc: any, sub) => {
        let source = "Direct / Private";
        if (sub.utm_source) source = `UTM: ${sub.utm_source}`;
        else if (sub.source_url && sub.source_url !== "direct" && sub.source_url.startsWith("http")) {
            try {
                const url = new URL(sub.source_url);
                source = url.hostname.replace("www.", "");
            } catch {
                source = "Direct / Private";
            }
        }
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});

    const sortedSources = Object.entries(sourceStats).sort((a: any, b: any) => b[1] - a[1]);

    return (
        <div className="min-h-screen pt-28 pb-20 px-6 bg-background">
            <div className="max-w-7xl mx-auto animate-fade-in">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.push("/admin")}
                            className="group flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-xs uppercase tracking-widest mb-4"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to HQ
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-card-border flex items-center justify-center text-2xl shadow-inner">
                                👥
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-foreground italic">Subscriber Intelligence</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="glass px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-transparent border-card-border outline-none hover:bg-foreground/5 transition-all"
                        >
                            <option value="all" className="bg-background text-foreground">All Projects</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id} className="bg-background text-foreground">{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr,350px] gap-12 items-start">

                    {/* SUBSCRIBERS FEED */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/50 ml-2">Live Stream</h2>
                            <div className="flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-sky animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent-sky/40">Broadcasting</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 glass rounded-[2rem] animate-pulse" />)}
                            </div>
                        ) : subscribers.length === 0 ? (
                            <div className="glass p-20 rounded-[4rem] text-center border-dashed border-card-border opacity-60">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">No Intelligence Data Captured</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {subscribers.map((sub) => (
                                    <div key={sub.id} className="glass p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 glass-hover group border-l-2 border-accent-sky/20">
                                        <div className="flex gap-5 items-center">
                                            <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-card-border flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                👤
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{sub.name}</h3>
                                                <p className="text-xs text-foreground/70 font-light">{sub.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 mb-1">Target Project</p>
                                                <span className="text-[10px] font-black text-accent-sky bg-accent-sky/10 border border-accent-sky/20 px-3 py-1.5 rounded-xl block">
                                                    {sub.project_name || projects.find(p => p.id === (sub as any).project_id)?.name || "Unknown Node"}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 mb-1">Referral Source</p>
                                                <span className="text-[10px] font-medium text-foreground/40 italic">
                                                    {sub.utm_source
                                                        ? `UTM: ${sub.utm_source}`
                                                        : (sub.source_url === "direct" || !sub.source_url || !sub.source_url.startsWith("http")
                                                            ? "Direct Navigation"
                                                            : (() => {
                                                                try {
                                                                    return new URL(sub.source_url).hostname.replace("www.", "");
                                                                } catch {
                                                                    return "Direct Navigation";
                                                                }
                                                            })()
                                                        )
                                                    }
                                                </span>
                                            </div>

                                            <div className="text-right hidden md:block">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 mb-1">Timestamp</p>
                                                <span className="text-[10px] text-foreground/50">
                                                    {sub.created_at ? new Date(sub.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ORIGIN ANALYTICS */}
                    <aside className="space-y-8">
                        <div className="glass p-8 rounded-[3rem] bg-accent-sky/5 border-accent-sky/10">
                            <h2 className="text-sm font-black uppercase tracking-widest text-accent-sky mb-8 italic">Origin Intelligence</h2>

                            <div className="space-y-6">
                                {sortedSources.length > 0 ? sortedSources.map(([source, count]: [string, any], i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70 max-w-[180px] truncate">{source}</span>
                                            <span className="text-xs font-black text-foreground">{count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-sky transition-all duration-1000"
                                                style={{ width: `${(count / subscribers.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[9px] text-white/20 italic">Awaiting source data...</p>
                                )}
                            </div>

                            <div className="mt-10 pt-6 border-t border-card-border">
                                <p className="text-[9px] text-foreground/50 font-medium leading-relaxed uppercase tracking-wider">
                                    Total Stream Analysis: <span className="text-foreground font-black">{subscribers.length} Entries</span>
                                </p>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-[2rem] bg-accent-emerald/5 border-accent-emerald/10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-emerald mb-4">Command Tips</h3>
                            <ul className="space-y-3">
                                {[
                                    "Source URLs help identify marketing impact.",
                                    "UTM parameters provide precise campaign attribution.",
                                    "Direct traffic indicates high brand awareness.",
                                ].map((tip, i) => (
                                    <li key={i} className="text-[9px] text-foreground/60 font-medium italic flex gap-2">
                                        <span className="text-accent-emerald">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

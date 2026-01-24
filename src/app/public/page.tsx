"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

type PublicProject = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  subscriber_count?: number;
};

export default function PublicWaitlistsPage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "projects"),
          where("is_active", "==", true),
          orderBy("created_at", "desc")
        );
        const snapshot = await getDocs(q);
        const projectData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PublicProject[];

        setProjects(projectData);
      } catch (err) {
        console.error("Error loading public projects:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="relative mb-20 text-center animate-fade-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-sky/5 rounded-full blur-[120px] -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/20 text-accent-sky text-[10px] font-bold uppercase tracking-widest mb-6">
            🚀 My Product Pipeline
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Discover My <span className="text-gradient">Builds</span>
          </h1>

          <p className="max-w-2xl mx-auto text-foreground/70 text-lg font-normal leading-relaxed">
            A curated collection of my upcoming SaaS products. Browse the features, explore the future, and secure your place on the exclusive waitlists.
          </p>
        </div>

        {/* PROJECT GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 glass rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass p-20 rounded-[4rem] text-center border-dashed border-card-border animate-fade-in">
            <p className="text-foreground/40 text-sm tracking-widest uppercase mb-4">No Active Nodes</p>
            <p className="text-foreground/60 text-xs italic font-light max-w-xs mx-auto">
              Currently no public projects are broadcasting. Check back soon for my next launch.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className="group relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="glass p-8 rounded-[3rem] glass-hover h-full flex flex-col justify-between gap-8 animate-fade-in border-t-4 border-t-accent-sky/20">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-card-border flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        🚀
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-accent-sky/60 border border-accent-sky/10 px-2 py-1 rounded-lg">
                        OPEN
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-foreground group-hover:text-accent-sky transition-colors tracking-tight">
                      {p.name}
                    </h2>

                    <p className="text-sm text-foreground/70 font-normal leading-relaxed line-clamp-3">
                      {p.short_description || "Building something amazing. Join the journey to get notified first."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-card-border">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      Explore Product
                    </div>
                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                      <span className="text-foreground group-hover:text-accent-sky">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* DEVELOPER SHOWCASE */}
        <div className="mt-32 max-w-5xl mx-auto animate-fade-in group">
          <div className="glass p-16 rounded-[4rem] bg-foreground/[0.01] border-card-border relative overflow-hidden flex flex-col md:flex-row items-center gap-16 text-center md:text-left transition-all hover:bg-foreground/[0.03]">
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-accent-sky/5 blur-[120px] pointer-events-none" />

            <div className="relative">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-accent-sky/20 to-accent-emerald/20 border border-card-border flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform duration-700">
                👨‍💻
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent-sky flex items-center justify-center text-xs border-4 border-background shadow-lg">
                ✓
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-4xl font-bold text-foreground tracking-tight">Meet the Developer</h2>
                <p className="text-accent-sky text-[11px] font-bold uppercase tracking-[0.3em]">justaman045</p>
              </div>
              <p className="text-foreground/70 text-lg leading-relaxed font-normal max-w-xl">
                I'm Aman, a full-stack developer dedicated to building high-performance
                web applications with modern aesthetics. This dashboard tracks my
                latest SaaS experiments and production-ready tools.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="https://github.com/justaman045"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-foreground/5 border border-card-border text-foreground/60 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background hover:scale-105 transition-all flex items-center gap-3"
                >
                  <img src="https://cdnt.icons8.com/images/v3/github.svg" className="w-4 h-4 invert opacity-60 group-hover:invert-0" alt="" />
                  <span>VIEW ON GITHUB</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

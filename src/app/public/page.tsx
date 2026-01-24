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
            🚀 My Project Ecosystem
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Explore My <span className="text-gradient">Vision</span>
          </h1>

          <p className="max-w-2xl mx-auto text-white/40 text-lg font-light leading-relaxed italic">
            "A curated collection of my upcoming SaaS ventures. Browse the units, dive into the visions, and secure your place on the exclusive waitlists."
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
          <div className="glass p-20 rounded-[4rem] text-center border-dashed border-white/5 animate-fade-in">
            <p className="text-white/20 text-sm tracking-widest uppercase mb-4">No Active Nodes</p>
            <p className="text-white/40 text-xs italic font-light max-w-xs mx-auto">
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
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        🚀
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-accent-sky/40 border border-accent-sky/10 px-2 py-1 rounded-lg">
                        LIVE
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-white group-hover:text-accent-sky transition-colors tracking-tight">
                      {p.name}
                    </h2>

                    <p className="text-sm text-white/40 font-light leading-relaxed italic line-clamp-3">
                      "{p.short_description || "A revolutionary new unit currently in the final phases of conceptual orchestration."}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                      View Journey
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                      <span className="text-white group-hover:text-accent-sky">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* STATUS FOOTER */}
        <div className="mt-32 text-center p-20 glass rounded-[4rem] relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-sky/10 rounded-full blur-[100px]" />
          <h3 className="text-2xl font-black text-white mb-4 italic">The Journey Continues</h3>
          <p className="text-white/30 text-sm max-w-md mx-auto mb-8 font-light">
            Follow along as I instantiate new project nodes and push the boundaries of modern SaaS development. Join the waitlists to be part of the beta phases.
          </p>
          <div className="flex justify-center items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-sky animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

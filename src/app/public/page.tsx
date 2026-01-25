"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen pt-32 pb-20 px-6 bg-background relative overflow-hidden">
      {/* Background Pattern - Subtle */}
      <div className="fixed inset-0 bg-grid-small pointer-events-none" />

      {/* Gentle Gradient Orb to break flatness */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 transition-all">

        {/* HEADER */}
        <div className="mb-24 space-y-6 text-center md:text-left">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground mb-4">
            PIPELINE<span className="text-accent-primary">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/60 max-w-2xl font-medium text-balance leading-relaxed">
            A curated collection of experimental builds and production-ready systems.
          </p>
        </div>

        {/* PROJECTS GRID (BENTO) */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-card/50 border border-card-border animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 border border-dashed border-card-border text-center text-foreground/40 font-mono text-sm rounded-[2rem]">
            NO ACTIVE SIGNALS DETECTED.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className="group relative flex flex-col justify-between p-8 bg-card/50 backdrop-blur-sm border border-card-border transition-all hover:bg-card hover:border-accent-primary/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-primary/5 h-80 rounded-[2rem]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 font-bold">0{i + 1}</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_10px_currentColor]" />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-accent-primary transition-colors">
                    {p.name}
                  </h2>

                  <p className="text-sm text-foreground/60 line-clamp-3 leading-relaxed">
                    {p.short_description || "System status normal. Join waitlist for access."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-card-border/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">Access Node</span>
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <span className="text-foreground group-hover:text-accent-primary">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* DEVELOPER FOOTER */}
        <div className="mt-32 pt-12 border-t border-card-border flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Developed by Aman</h3>
            <p className="text-xs text-foreground/60 max-w-md">
              Full-stack engineer focused on high-performance interfaces and distributed systems.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

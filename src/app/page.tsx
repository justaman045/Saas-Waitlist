"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc, getCountFromServer } from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_active: boolean;
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalSignups, setTotalSignups] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projectsRef = collection(db, "projects");
        const q = query(
          projectsRef,
          where("is_active", "==", true),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const projData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        setProjects(projData);

        const entriesRef = collection(db, "waitlist_entries");
        const countSnapshot = await getCountFromServer(entriesRef);
        setTotalSignups(countSnapshot.data().count);
      } catch (error) {
        console.error("Error loading home page data:", error);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 bg-grid-small pointer-events-none" />
      {/* Animated Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-float-slow pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-32 relative z-10">

        {/* HERO SECTION */}
        <div className="relative mb-32 text-center md:text-left animate-fade-in">
          <div className="max-w-4xl mx-auto md:mx-0">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-foreground leading-[1] mb-6">
              Building the <br />
              <span className="text-gradient">Future.</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/60 font-medium leading-relaxed max-w-2xl border-l-4 border-indigo-500/50 pl-6 mb-12">
              Join the evolution of modern SaaS. Secure your place on the exclusive waitlists for my upcoming product line.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link
                href="/public"
                className="btn-gradient px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40"
              >
                Explore Pipeline
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-full border border-card-border bg-card/50 backdrop-blur-md text-foreground text-xs font-bold uppercase tracking-[0.2em] hover:bg-card hover:text-indigo-400 transition-all"
              >
                Creator Login
              </Link>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-32">
          {[
            { label: "Active Products", value: projects.length, icon: "🚀", color: "text-indigo-400" },
            { label: "Total Subscribers", value: totalSignups ?? "...", icon: "👥", color: "text-purple-400" },
            { label: "Viral Growth", value: "Referrals", icon: "✨", color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="glass p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500 text-6xl">
                {stat.icon}
              </div>
              <div className="relative z-10">
                <p className={`text-5xl font-black mb-2 tracking-tight ${stat.color} drop-shadow-sm`}>
                  {stat.value}
                </p>
                <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PROJECTS GRID */}
        <div className="mb-32">
          <div className="flex items-end justify-between mb-12 border-b border-card-border pb-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                Live Projects
              </h2>
              <p className="text-foreground/50 font-medium">Select a node to access the network.</p>
            </div>
            <Link href="/public" className="text-indigo-400 font-bold uppercase tracking-widest text-xs hover:text-indigo-300 transition-colors">View All →</Link>
          </div>

          {!loading && projects.length === 0 ? (
            <div className="glass p-20 text-center border-dashed border-card-border opacity-50">
              <p className="text-foreground/40 font-mono">NO SIGNALS DETECTED.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className="glass p-8 group flex flex-col justify-between h-[320px] relative overflow-hidden"
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-xl group-hover:rotate-12 transition-transform duration-300 shadow-inner">
                        📦
                      </div>
                      <span className="text-[10px] font-mono text-foreground/30">ID: {p.slug.slice(0, 3).toUpperCase()}</span>
                    </div>

                    <h3 className="text-3xl font-bold text-foreground group-hover:text-indigo-400 transition-colors mb-2">
                      {p.name}
                    </h3>
                    <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed">
                      {p.short_description || "System status normal. Join waitlist for access."}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-6 border-t border-card-border/50 group-hover:border-indigo-500/30 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 group-hover:text-indigo-400">Initialize</span>
                    <span className="text-foreground/40 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* DEVELOPER FOOTER SECTION */}
        <section className="mt-32 border-t border-card-border pt-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-foreground/5 border border-card-border">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">System Operational</span>
          </div>
        </section>

      </main>
    </div>
  );
}

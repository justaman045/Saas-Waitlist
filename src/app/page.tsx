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

type ProfileCache = {
  github: {
    name: string;
    bio: string;
    avatar: string;
    repos: number;
    followers: number;
    url: string;
  };
  linkedin: {
    title: string;
    description: string;
    avatar: string;
    url: string;
  };
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalSignups, setTotalSignups] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileCache | null>(null);
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

        const profileRef = doc(db, "profile_cache", "1");
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as ProfileCache);
        }
      } catch (error) {
        console.error("Error loading home page data:", error);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-32">
        {/* HERO */}
        <div className="relative mb-32">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Building the <span className="text-gradient">Future</span>
            </h1>
            <p className="mt-8 text-xl text-foreground/70 font-medium leading-relaxed border-l-4 border-accent-sky/20 pl-8">
              Join the evolution of modern SaaS. Secure your place on the exclusive waitlists for my upcoming product line.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/public"
                className="px-8 py-4 rounded-2xl bg-foreground text-background text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-foreground/5"
              >
                Explore Product Pipeline
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-32">
          {[
            { label: "Active Products", value: projects.length, icon: "🚀", color: "from-blue-500/20" },
            { label: "Total Subscribers", value: totalSignups ?? "...", icon: "👥", color: "from-emerald-500/20" },
            { label: "Viral Growth", value: "Referrals", icon: "✨", color: "from-purple-500/20" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} to-transparent opacity-50`} />
              <div className="text-2xl mb-4">{stat.icon}</div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-foreground/60 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* PROJECTS GRID */}
        <div className="mb-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Live Projects</h2>
              <p className="text-foreground/60">Select a project to explore and join the waitlist.</p>
            </div>
            <Link href="/public" className="text-accent-sky hover:underline text-sm font-medium">View all</Link>
          </div>

          {!loading && projects.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center border-dashed border-card-border">
              <p className="text-foreground/50">No active projects at the moment. Stay tuned!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className="glass p-8 rounded-[38px] glass-hover group"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      📦
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/20 text-accent-sky text-[10px] font-bold tracking-widest uppercase">
                      Waitlist Open
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground/90">{p.name}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-8 line-clamp-2 italic">
                    {p.short_description || "Building something amazing. Join the journey to get notified first."}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-card-border">
                    <span className="text-[10px] font-medium text-foreground/50 uppercase tracking-[0.2em]">Join Now</span>
                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-accent-sky group-hover:text-background transition-all">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CREATOR SHOWCASE */}
        <section className="mt-48 max-w-4xl mx-auto animate-fade-in group">
          <div className="glass p-12 rounded-[3.5rem] bg-foreground/[0.01] border-card-border relative overflow-hidden flex flex-col md:flex-row items-center gap-12 text-center md:text-left transition-all hover:bg-foreground/[0.03]">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-sky/5 blur-[100px] pointer-events-none" />

            <div className="relative">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-accent-sky/20 to-accent-emerald/20 border border-card-border flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                👨‍💻
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent-sky flex items-center justify-center text-[10px] border-4 border-background shadow-lg">
                ✓
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase">CREATOR SHOWCASE</h2>
                <p className="text-accent-sky text-sm font-bold uppercase tracking-widest">justaman045</p>
              </div>
              <p className="text-foreground/70 text-lg leading-relaxed font-normal">
                Building high-performance SaaS solutions with modern aesthetics.
                Follow my product pipeline for the latest releases.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                <Link
                  href="https://github.com/justaman045"
                  target="_blank"
                  className="px-6 py-3 rounded-xl bg-foreground/5 border border-card-border text-foreground/60 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background hover:scale-105 transition-all flex items-center gap-3"
                >
                  <img src="https://cdnt.icons8.com/images/v3/github.svg" className="w-4 h-4 invert opacity-60 group-hover:invert-100 dark:invert" alt="" />
                  <span>VIEW GITHUB</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

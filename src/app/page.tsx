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
        <div className="relative mb-24 text-center animate-fade-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-sky/10 rounded-full blur-[120px] -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[11px] font-medium mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
            </span>
            Active Studio Hub
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Instantiating My <br />
            <span className="text-gradient">Next Generation</span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light italic">
            "My personal hub to manage and showcase all my upcoming SaaS builds. <br className="hidden md:block" />
            Follow my journey, join the waitlists, and get exclusive early access."
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/public"
              className="px-8 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition-all flex items-center gap-2 group shadow-xl shadow-white/5"
            >
              Explore Live Projects
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
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
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* PROJECTS GRID */}
        <div className="mb-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Live Projects</h2>
              <p className="text-white/40">Select a project to explore and join the waitlist.</p>
            </div>
            <Link href="/public" className="text-accent-sky hover:underline text-sm font-medium">View all</Link>
          </div>

          {!loading && projects.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center border-dashed border-white/5">
              <p className="text-white/30">No active projects at the moment. Stay tuned!</p>
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
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      📦
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/20 text-accent-sky text-[10px] font-bold tracking-widest uppercase">
                      Waitlist Open
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white/90">{p.name}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-8 line-clamp-2 italic">
                    {p.short_description || "Building something amazing. Join the journey to get notified first."}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">Join Now</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-sky group-hover:text-black transition-all">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CREATOR */}
        {profile && (
          <section className="mt-32 pt-24 border-t border-white/5">
            <div className="glass p-12 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-sky/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="relative animate-float">
                  <div className="absolute inset-0 bg-accent-sky/20 rounded-full blur-[40px]" />
                  <img
                    src={profile.github.avatar}
                    className="w-40 h-40 rounded-[2.5rem] relative z-10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border border-white/10"
                    alt="Creator"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-4">Meet the Creator</h2>
                  <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-xl font-light">
                    Hi, I'm <span className="text-white font-medium">{profile.github.name}</span>.
                    I'm building a suite of SaaS products for indie developers.
                    {profile.github.bio}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <a href={profile.github.url} target="_blank" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all">
                      GitHub
                    </a>
                    <a href={profile.linkedin.url} target="_blank" className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-white/20 text-xs tracking-widest uppercase">
        © 2026 Projekt Notify · One Build At A Time
      </footer>
    </div>
  );
}

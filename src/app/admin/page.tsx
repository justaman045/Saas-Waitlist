"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, getCountFromServer } from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_active: boolean;
  created_at: any;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalSignups, setTotalSignups] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [topReferrers, setTopReferrers] = useState<Array<{ name: string; email: string; count: number }>>([]);

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

  // ----- LOAD DATA -----
  const loadData = async () => {
    setLoadingProjects(true);

    try {
      // Load Projects
      const q = query(collection(db, "projects"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      setProjects(data);

      // Load Signups
      const entriesRef = collection(db, "waitlist_entries");
      const countSnapshot = await getCountFromServer(entriesRef);
      setTotalSignups(countSnapshot.data().count);

      // Load Top Referrers
      const allEntriesSnap = await getDocs(entriesRef);
      const allEntries = allEntriesSnap.docs.map(d => d.data());

      const counts: Record<string, number> = {};
      allEntries.forEach(entry => {
        if (entry.referred_by) {
          counts[entry.referred_by] = (counts[entry.referred_by] || 0) + 1;
        }
      });

      const sortedCodes = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const resolvedReferrers = sortedCodes.map(([code, count]) => {
        const owner = allEntries.find(e => e.referral_code === code);
        return {
          name: owner?.name || "Anonymous",
          email: owner?.email || "Unknown",
          count
        };
      });

      setTopReferrers(resolvedReferrers);

    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
    }
    setLoadingProjects(false);
  };

  useEffect(() => {
    if (authChecked) loadData();
  }, [authChecked]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass p-8 rounded-3xl animate-pulse text-foreground/50 text-sm tracking-widest uppercase">
          Initializing Secure Access...
        </div>
      </div>
    );
  }

  const liveProjects = projects.filter(p => p.is_active);
  const devProjects = projects.filter(p => !p.is_active);

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 bg-background relative overflow-hidden">

      {/* PROFESSIONAL ATMOSPHERE (SUBTLER) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-accent-sky/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[600px] h-[600px] bg-accent-emerald/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto animate-fade-in">

        {/* HEADER: COMPACT STRATEGIC BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-card-border flex items-center justify-center text-xl shadow-xl backdrop-blur-2xl">
              📊
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none">Dashboard</h1>
              <p className="text-foreground/50 text-[10px] uppercase tracking-[0.2em] font-semibold mt-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                Waitlist Engine: Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/admin/new")}
              className="px-6 py-3 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl flex items-center gap-2"
            >
              <span>+</span> Create Project
            </button>
            <div className="flex bg-foreground/[0.03] border border-card-border rounded-2xl p-1 backdrop-blur-3xl">
              <button
                onClick={() => router.push("/admin/subscribers")}
                className="px-5 py-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Subscribers
              </button>
              <button
                onClick={() => router.push("/admin/analytics")}
                className="px-5 py-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Analytics
              </button>
            </div>
            <button
              onClick={async () => {
                await signOut(auth);
                router.replace("/login");
              }}
              className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all border border-red-500/5"
              title="Sign Out"
            >
              ⏻
            </button>
          </div>
        </div>

        {/* HIGH-DENSITY METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Subscribers", value: totalSignups ?? "...", icon: "📈", color: "from-accent-sky/20", unit: "Enrolled" },
            { label: "Active Lists", value: liveProjects.length, icon: "🟢", color: "from-accent-emerald/20", unit: "Published" },
            { label: "Drafts", value: devProjects.length, icon: "🏗️", color: "from-orange-500/20", unit: "Internal" },
            { label: "Total Projects", value: projects.length, icon: "📁", color: "from-purple-500/20", unit: "Total" },
          ].map((stat, i) => (
            <div key={i} className="glass p-7 rounded-[2.5rem] relative overflow-hidden group border-card-border transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} to-transparent opacity-10 blur-xl group-hover:scale-150 transition-transform duration-1000`} />
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl opacity-40 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">{stat.label}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <span className="text-[8px] text-foreground/30 font-bold uppercase tracking-widest">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* STRATEGIC DASHBOARD LAYOUT */}
        <div className="grid lg:grid-cols-[1fr,340px] gap-12 items-start">

          {/* PROJECT MANAGEMENT */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Project Management</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-foreground/10 to-transparent mx-8 opacity-50" />
            </div>

            {loadingProjects ? (
              <div className="space-y-5">
                {[1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-3xl animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="glass p-24 rounded-[3.5rem] text-center border-dashed border-card-border opacity-30">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]">No projects found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="glass p-8 rounded-[3rem] hover:bg-foreground/[0.03] group flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-l-4 transition-all overflow-hidden"
                    style={{ borderLeftColor: project.is_active ? 'var(--accent-emerald)' : 'var(--card-border)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-foreground transition-colors">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${project.is_active ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-foreground/5 text-foreground/20 border border-card-border'}`}>
                          {project.is_active ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-[13px] text-foreground/70 font-normal leading-relaxed line-clamp-1 max-w-md">
                        {project.short_description || "No project description available."}
                      </p>
                    </div>

                    <div className="flex items_center gap-4">
                      <button
                        onClick={() => router.push(`/admin/${project.id}`)}
                        className="h-12 px-8 rounded-2xl bg-foreground/5 border border-card-border text-[10px] text-foreground/70 font-bold uppercase tracking-widest hover:bg-foreground hover:text-background hover:scale-[1.05] transition-all"
                      >
                        Edit
                      </button>
                      <a
                        href={`/p/${project.slug}`}
                        target="_blank"
                        className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:scale-110 transition-transform grayscale hover:grayscale-0 opacity-40 hover:opacity-100 border border-card-border"
                        title="View Live Page"
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* INTEL SIDEBAR */}
          <aside className="space-y-10">

            {/* REFERRAL LEADERBOARD (REFINED) */}
            <div className="glass p-8 rounded-[3rem] bg-accent-sky/5 border-card-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-sky/5 blur-3xl -z-10" />

              <div className="mb-10">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-accent-sky">Top Advocates</h2>
                <p className="text-foreground/40 text-[9px] uppercase tracking-widest font-bold mt-2">Referral Leaders</p>
              </div>

              <div className="space-y-3.5">
                {loadingProjects ? (
                  [1, 2, 3].map(i => <div key={i} className="h-14 glass bg-foreground/5 rounded-2xl animate-pulse" />)
                ) : topReferrers.length === 0 ? (
                  <p className="text-[9px] text-foreground/30 italic text-center py-8">Static noise...</p>
                ) : (
                  topReferrers.map((winner, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.02] border border-card-border hover:border-foreground/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border ${i === 0 ? 'bg-accent-sky/10 border-accent-sky/20 text-accent-sky' : 'bg-foreground/5 border-card-border text-foreground/20'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-foreground/80">{winner.name}</p>
                          <p className="text-[9px] text-foreground/40 truncate max-w-[120px]">{winner.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-foreground tracking-widest leading-none">{winner.count}</span>
                        <p className="text-[7px] font-black text-accent-emerald uppercase mt-0.5">Points</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-center">
                <p className="text-[9px] text-foreground/5 font-bold uppercase tracking-[0.4em] leading-none">Insight Verified</p>
              </div>
            </div>

            {/* QUICK TIPS */}
            <div className="glass p-8 rounded-[3rem] bg-foreground/[0.01] border-card-border">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent-emerald mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.3)]" /> Usage Tips
              </h3>
              <ul className="space-y-5">
                {[
                  "Keep your short descriptions punchy for better impact.",
                  "Add FAQs to reduce user friction during signup.",
                  "Use the launch signal to notify users of progress.",
                ].map((tip, i) => (
                  <li key={i} className="text-[11px] text-foreground/60 font-normal leading-relaxed flex gap-3">
                    <span className="text-accent-emerald">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* FOOTER */}
        <div className="mt-40 pt-16 border-t border-card-border text-center">
          <p className="text-foreground/5 text-[9px] font-black uppercase tracking-[1em] italic">Projekt Notify Command Suite</p>
        </div>
      </div>
    </div>
  );
}

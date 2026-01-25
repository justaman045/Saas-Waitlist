"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, getCountFromServer, where, limit } from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_active: boolean;
  subscriber_count?: number;
  created_at: any;
};

type ActivityLog = {
  id: string;
  action: string;
  project: string;
  time: string;
};

type Referrer = {
  code: string;
  count: number;
};

type Subscriber = {
  id: string;
  email: string;
  project_name: string;
  created_at: any;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalSignups, setTotalSignups] = useState<number | null>(null);
  const [topReferrers, setTopReferrers] = useState<Referrer[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock removed. We will use recentSubscribers for this.

  const timeAgo = (date: any) => {
    if (!date) return "Unknown";
    const seconds = Math.floor((new Date().getTime() - new Date(date.seconds * 1000).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Projects
      const q = query(collection(db, "projects"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);

      // 2. Total Count
      const entriesRef = collection(db, "waitlist_entries");
      const countSnapshot = await getCountFromServer(entriesRef);
      setTotalSignups(countSnapshot.data().count);

      // 3. Project Data + Counts
      const data = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const pData = doc.data();
        const pEntriesRef = query(collection(db, "waitlist_entries"), where("project_id", "==", doc.id));
        const pCountSnap = await getCountFromServer(pEntriesRef);
        return {
          id: doc.id,
          ...pData,
          subscriber_count: pCountSnap.data().count
        };
      }));
      setProjects(data as Project[]);

      // 4. Recent Subscribers (Real Data)
      const recentQ = query(entriesRef, orderBy("created_at", "desc"), limit(5));
      const recentSnap = await getDocs(recentQ);
      const recentData = recentSnap.docs.map(d => ({
        id: d.id,
        email: d.data().email,
        project_name: d.data().project_name,
        created_at: d.data().created_at
      }));
      setRecentSubscribers(recentData as Subscriber[]);

      // 5. Top Referrers (Client-side Aggregation for simplicity)
      const allRefSnap = await getDocs(entriesRef); // Warning: expensive at scale, but fine for MVP
      const counts: Record<string, number> = {};
      allRefSnap.docs.forEach(d => {
        const refCode = d.data().referred_by;
        if (refCode) counts[refCode] = (counts[refCode] || 0) + 1;
      });
      const sortedRefs = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([code, count]) => ({ code, count }));
      setTopReferrers(sortedRefs);

    } catch (err) {
      console.error("Dashboard error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-grid-small pointer-events-none" />
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              Mission <span className="text-gradient">Control.</span>
            </h1>
            <p className="text-foreground/60 font-medium max-w-md">
              Oversee your SaaS ecosystem. Manage deployments, track waitlists, and analyze growth signals.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/projects"
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-secondary hover:bg-secondary/80 border border-card-border transition-all flex items-center gap-2 text-foreground/80 hover:text-foreground"
            >
              View Projects
            </Link>
            <Link
              href="/admin/new"
              className="btn-gradient px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
            >
              <span>+</span> Deploy New Node
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                await signOut(auth);
                window.location.href = "/login";
              }}
              className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
              title="Disconnect"
            >
              ⏻
            </button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Signups */}
          <div className="glass p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-indigo-400 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-5xl">
              👥
            </div>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Audience</p>
            <h3 className="text-5xl font-black text-foreground tracking-tight">{totalSignups ?? "-"}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-foreground/40 font-mono">
              <span className="text-green-500">↑ 12%</span> vs last week
            </div>
          </div>

          {/* Active Projects */}
          <div className="glass p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-purple-400 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-5xl">
              🚀
            </div>
            <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Active Signals</p>
            <h3 className="text-5xl font-black text-foreground tracking-tight">{projects.filter(p => p.is_active).length}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-foreground/40 font-mono">
              <span className="text-foreground/20">System Nominal</span>
            </div>
          </div>

          {/* Recent Subscribers */}
          <div className="glass p-8 rounded-[2rem] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">Recent Subscribers</p>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="space-y-3">
              {recentSubscribers.length === 0 ? (
                <p className="text-foreground/40 text-xs">No recent activity.</p>
              ) : (
                recentSubscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground/80 font-medium">{sub.email}</span>
                    <span className="text-foreground/30 font-mono">
                      {sub.created_at?.seconds
                        ? new Date(sub.created_at.seconds * 1000).toLocaleDateString()
                        : "Just now"}
                    </span>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div className="glass rounded-[2.5rem] overflow-hidden border border-card-border shadow-2xl shadow-black/5 mb-12">
          <div className="p-8 border-b border-card-border flex items-center justify-between bg-card/50">
            <h2 className="text-lg font-bold text-foreground">Project Matrix</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors">
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Synchronizing Data...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-foreground/40 text-sm">No projects found. Deploy your first node.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                <tr>
                  <th className="p-6 pl-8">Project Identity</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Waitlist Size</th>
                  <th className="p-6 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {projects.map((p) => (
                  <tr key={p.id} className="group hover:bg-foreground/[0.02] transition-colors">
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                          📦
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm group-hover:text-indigo-400 transition-colors">{p.name}</div>
                          <div className="font-mono text-[10px] text-foreground/40">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${p.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-foreground/5 border-card-border text-foreground/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500 animate-pulse' : 'bg-foreground/40'}`} />
                        {p.is_active ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-mono text-sm font-bold text-foreground">{p.subscriber_count}</span>
                    </td>
                    <td className="p-6 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <a href={`/p/${p.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="View Public Page">
                          ↗
                        </a>
                        <Link href={`/admin/${p.id}`} className="px-4 py-2 rounded-lg bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-90 ml-2">
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* BOTTOM ROW: REFERRERS & SUBSCRIBERS */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* TOP REFERRERS */}
          <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                <span className="text-2xl">🏆</span> Top Referrers
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Leaderboard</span>
            </div>
            {topReferrers.length === 0 ? (
              <div className="text-center py-12 text-foreground/40 text-xs italic">
                No referral data yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topReferrers.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-card-border">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-amber-600 text-white' : 'bg-foreground/10 text-foreground'}`}>
                        {i + 1}
                      </div>
                      <div className="font-mono text-xs text-foreground/70">{ref.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{ref.count}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-foreground/40">Invites</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT SUBSCRIBERS */}
          <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                <span className="text-2xl">✨</span> New Signups
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Live Feed</span>
            </div>
            {recentSubscribers.length === 0 ? (
              <div className="text-center py-12 text-foreground/40 text-xs italic">
                Waiting for signals...
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubscribers.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-foreground/5 transition-colors border-b border-card-border last:border-0">
                    <div>
                      <div className="font-bold text-sm text-foreground">{sub.email}</div>
                      <div className="text-[10px] text-foreground/40 font-mono mt-0.5">via {sub.project_name}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      New
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div >
  );
}

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useRouter } from "next/navigation";

type Project = { id: string; name: string };
type Entry = { project_id: string; created_at: any; referred_by: string | null };

export default function AnalyticsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projSnap, entrySnap] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "waitlist_entries")),
        ]);

        const projData = projSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name as string,
        }));

        const entryData = entrySnap.docs.map((doc) => ({
          project_id: doc.data().project_id,
          created_at: doc.data().created_at?.toDate?.() || doc.data().created_at,
          referred_by: doc.data().referred_by,
        })) as Entry[];

        setProjects(projData);
        setEntries(entryData);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl animate-pulse text-white/50 text-sm tracking-widest uppercase">
          Synthesizing Intelligence Data...
        </div>
      </div>
    );
  }

  const totalSignups = entries.length;
  const totalReferrals = entries.filter((e) => e.referred_by).length;

  const projectStats = projects.map((p) => {
    const eForProject = entries.filter((e) => e.project_id === p.id);
    const referrals = eForProject.filter((e) => e.referred_by).length;
    return {
      id: p.id,
      name: p.name,
      signups: eForProject.length,
      referrals,
    };
  });

  const byDayMap: Record<string, number> = {};
  entries.forEach((e) => {
    try {
      const day = new Date(e.created_at).toISOString().slice(0, 10);
      byDayMap[day] = (byDayMap[day] || 0) + 1;
    } catch (e) { }
  });

  const growthData = Object.entries(byDayMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, count]) => ({ day, count }));

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto animate-fade-in">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-foreground/5 border border-card-border flex items-center justify-center text-xl shadow-inner">
                📈
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">Project intelligence</h1>
            </div>
            <p className="text-foreground/70 text-sm font-light">
              Aggregated performance metrics across <span className="text-accent-sky font-medium">{projects.length}</span> project nodes.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="px-6 py-2.5 rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-card-border text-foreground text-sm font-medium transition-all flex items-center gap-2"
          >
            ← Back to Terminal
          </button>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Aggregate Signups", value: totalSignups, icon: "👥", color: "from-blue-500/20" },
            { label: "Viral Conversions", value: totalReferrals, icon: "✨", color: "from-emerald-500/20" },
            { label: "Active Nodes", value: projects.length, icon: "🚀", color: "from-purple-500/20" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-[2.5rem] relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} to-transparent opacity-50`} />
              <div className="text-2xl mb-4">{stat.icon}</div>
              <p className="text-4xl font-black text-foreground mb-1">{stat.value}</p>
              <p className="text-foreground/70 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">

          {/* GROWTH CHART */}
          <section className="glass p-8 rounded-[3rem] overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-foreground/90">Growth Trajectory</h2>
              <span className="text-[10px] uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-foreground/5 border border-card-border text-foreground/70">Real-time Feed</span>
            </div>

            {growthData.length === 0 ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-card-border rounded-[2rem]">
                <p className="text-foreground/40 text-xs tracking-widest uppercase italic">Awaiting Growth Data Points...</p>
              </div>
            ) : (
              <div className="h-80 w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--foreground-muted)" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--foreground-muted)" }}
                    />
                    <Tooltip
                      contentStyle={{ background: "rgba(var(--card), 0.9)", border: "1px solid var(--accent-sky)", borderRadius: "1rem", fontSize: "12px", boxShadow: "0 10px 40px -10px rgba(56,189,248,0.2)" }}
                      itemStyle={{ color: "#38bdf8", fontWeight: "bold" }}
                      cursor={{ stroke: "rgba(56,189,248,0.2)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#38bdf8"
                      strokeWidth={5}
                      dot={{ fill: "#0f172a", stroke: "#38bdf8", strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 8, stroke: "#38bdf8", strokeWidth: 0, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* PER-PROJECT STATS */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-foreground/90 ml-2">Node Efficiency</h2>

            {projectStats.length === 0 ? (
              <div className="glass p-8 rounded-[2rem] text-center border-dashed border-card-border">
                <p className="text-foreground/40 text-xs font-light">No node metrics found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectStats.map((p) => (
                  <div
                    key={p.id}
                    className="glass p-6 rounded-[2rem] glass-hover group flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-accent-sky transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-foreground/70 font-medium uppercase tracking-widest mt-1">
                        Node Activation Stats
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-black text-foreground">{p.signups}</span>
                      <span className="block text-[8px] uppercase tracking-tighter text-accent-emerald font-bold">+{p.referrals} Referral</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

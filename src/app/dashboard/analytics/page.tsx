"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";

type Project = { id: string; name: string };
type Entry = { project_id: string; created_at: string; referred_by: string | null };

export default function AnalyticsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [projRes, entryRes] = await Promise.all([
        supabase.from("projects").select("id, name"),
        supabase
          .from("waitlist_entries")
          .select("project_id, created_at, referred_by"),
      ]);

      setProjects(projRes.data ?? []);
      setEntries(entryRes.data ?? []);
      setLoading(false);
    };

    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-slate-300">
        Loading analytics…
      </div>
    );
  }

  const totalSignups = entries.length;
  const totalReferrals = entries.filter((e) => e.referred_by).length;

  // per-project stats
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

  // growth chart: signups per day
  const byDayMap: Record<string, number> = {};
  entries.forEach((e) => {
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    byDayMap[day] = (byDayMap[day] || 0) + 1;
  });

  const growthData = Object.entries(byDayMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, count]) => ({ day, count }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of your waitlists performance.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs rounded-full border border-white/15 px-3 py-1 hover:bg-white/5"
        >
          ← Back to dashboard
        </button>
      </div>

      {/* TOP STATS */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[11px] text-slate-400 mb-1">Total signups</p>
          <p className="text-xl font-semibold text-emerald-300">
            {totalSignups}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[11px] text-slate-400 mb-1">Referrals</p>
          <p className="text-xl font-semibold text-sky-300">
            {totalReferrals}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[11px] text-slate-400 mb-1">Projects</p>
          <p className="text-xl font-semibold text-slate-100">
            {projects.length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr,1.2fr] gap-8">
        {/* GROWTH CHART */}
        <section className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            Signups over time
          </h2>
          {growthData.length === 0 ? (
            <p className="text-xs text-slate-400">No data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* PER-PROJECT STATS */}
        <section className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            By project
          </h2>
          {projectStats.length === 0 ? (
            <p className="text-xs text-slate-400">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projectStats.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-xs font-medium text-slate-100">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {p.signups} signups · {p.referrals} referrals
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

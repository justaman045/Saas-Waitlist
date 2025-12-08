"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug, short_description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProjects(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10 grid gap-8 md:grid-cols-[3fr,2fr] items-center">
        <div>
          <p className="mb-3 inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
            🚀 Launch-ready waitlists for all your products
          </p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Central hub for all your{" "}
            <span className="bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-transparent">
              SaaS waitlists
            </span>
          </h1>
          <p className="mb-6 text-sm text-slate-300">
            Spin up a new waitlist in seconds, collect emails, share referral
            links, and keep all your upcoming apps under one clean dashboard.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/dashboard"
              className="rounded-xl bg-sky-500 px-4 py-2 font-medium text-slate-950 shadow hover:bg-sky-400"
            >
              Open dashboard
            </a>
            <a
              href="#projects"
              className="rounded-xl border border-white/15 px-4 py-2 text-slate-100 hover:bg-white/5"
            >
              View public waitlists
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-sky-900/60 p-4 shadow-xl">
          <p className="mb-3 text-xs font-medium text-slate-300">
            Snapshot (demo)
          </p>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2">
              <span className="text-slate-300">Projects</span>
              <span className="font-semibold text-emerald-300">
                {loading ? "…" : projects.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2">
              <span className="text-slate-300">Total signups</span>
              <span className="font-semibold text-sky-300">Soon</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/30 px-3 py-2">
              <span className="text-slate-300">Referral tracking</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Live waitlists</h2>
          <span className="text-xs text-slate-400">
            Each project gets its own unique link.
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="text-xs text-slate-400">
            No public projects yet. Create one from the dashboard.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <a
                key={p.id}
                href={`/p/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-black/30 p-4 text-sm shadow hover:border-sky-400/60 hover:bg-black/50"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-50 group-hover:text-sky-100">
                    {p.name}
                  </h3>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-200">
                    Join waitlist
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {p.short_description ?? "Join the early access list."}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

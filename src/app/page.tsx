"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

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
  const supabase = createSupabaseBrowserClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalSignups, setTotalSignups] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileCache | null>(null);
  const [loading, setLoading] = useState(true);

  // Load projects, signups, profile
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1. Load active projects
      const { data: projData } = await supabase
        .from("projects")
        .select("id, name, slug, short_description, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setProjects(projData ?? []);

      // 2. Load signup count
      const { count } = await supabase
        .from("waitlist_entries")
        .select("id", { count: "exact", head: true });

      setTotalSignups(count ?? 0);

      // 3. Load cached profile data (GitHub + LinkedIn)
      const { data: profileData } = await supabase
        .from("profile_cache")
        .select("github, linkedin")
        .eq("id", 1)
        .single();

      setProfile(profileData);

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-200">

      {/* HERO SECTION */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1 mb-4 text-xs text-emerald-300 rounded-full border border-emerald-500/40 bg-emerald-500/10">
          🚀 Launch-ready waitlists for all Aman's SaaS products
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Central hub for all Aman's{" "}
          <span className="text-sky-400">SaaS waitlists</span>
        </h1>

        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          Manage all Aman's app waitlists, collect signups, track referrals, and 
          send launch emails — all from one unified dashboard.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-sm font-semibold"
          >
            Open dashboard
          </Link>

          <Link
            href="/public"
            className="px-5 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
          >
            View public waitlists
          </Link>
        </div>
      </div>

      {/* SNAPSHOT */}
      <div className="mb-20 rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Snapshot
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-slate-400">Projects</p>
            <p className="text-xl font-semibold text-sky-300">
              {projects.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-slate-400">Total signups</p>
            <p className="text-xl font-semibold text-emerald-300">
              {totalSignups ?? "…"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-slate-400">Referral tracking</p>
            <p className="text-xl font-semibold text-blue-300">Enabled</p>
          </div>
        </div>
      </div>

      {/* PUBLIC WAITLISTS */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Live waitlists
        </h2>

        {projects.length === 0 ? (
          <p className="text-slate-400">No live waitlists yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-white/10 bg-black/30 hover:border-sky-400/40 transition"
              >
                <p className="text-lg font-medium text-slate-100">{p.name}</p>
                <p className="text-xs text-slate-400 mt-2 mb-4">
                  {p.short_description || "No description provided."}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-slate-500">
                    Public waitlist available
                  </p>

                  <Link
                    href={`/p/${p.slug}`}
                    className="text-xs rounded-full border border-sky-500/40 px-3 py-1 text-sky-300 hover:bg-sky-500/10"
                  >
                    Join waitlist
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ABOUT THE CREATOR */}
      <div className="mt-20 border-t border-white/10 pt-12 pb-24">
        <h2 className="text-2xl font-semibold text-white mb-4">
          About the creator
        </h2>

        {!profile ? (
          <p className="text-slate-400 text-sm">Loading profile…</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-10">
            {/* GITHUB */}
            <div className="flex items-start gap-4">
              <img
                src={profile.github.avatar}
                className="w-20 h-20 rounded-full border border-white/20"
              />

              <div>
                <p className="text-lg font-semibold text-slate-100">
                  {profile.github.name}
                </p>
                <p className="text-xs text-slate-400 mb-2">
                  {profile.github.bio}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <p>Repos: {profile.github.repos}</p>
                  <p>Followers: {profile.github.followers}</p>
                </div>

                <a
                  href={profile.github.url}
                  target="_blank"
                  className="inline-block mt-3 px-3 py-1 border border-white/10 rounded-full text-xs hover:bg-white/5"
                >
                  View GitHub →
                </a>
              </div>
            </div>

            {/* LINKEDIN */}
            <div className="flex items-start gap-4">
              {profile.linkedin.avatar && (
                <img
                  src={profile.linkedin.avatar}
                  className="w-20 h-20 rounded-full border border-white/20"
                />
              )}

              <div>
                <p className="text-lg font-semibold text-slate-100">
                  {profile.linkedin.title }
                </p>
                <p className="text-xs text-slate-400 mb-2 max-w-xs leading-relaxed">
                  {profile.linkedin.description}
                </p>

                <a
                  href={profile.linkedin.url}
                  target="_blank"
                  className="inline-block mt-3 px-3 py-1 border border-white/10 rounded-full text-xs hover:bg-white/5"
                >
                  View LinkedIn →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

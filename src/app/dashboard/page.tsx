"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_active: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- AUTH GUARD -----
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (allowedEmail && user.email !== allowedEmail) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setUserEmail(user.email ?? null);
      setAuthChecked(true);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- LOAD PROJECTS -----
  const loadProjects = async () => {
    setLoadingProjects(true);

    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    setProjects(data ?? []);
    setLoadingProjects(false);
  };

  useEffect(() => {
    if (authChecked) loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  // ----- CREATE PROJECT -----
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const cleanSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const { error: err } = await supabase.from("projects").insert({
      name,
      slug: cleanSlug,
      short_description: desc,
    });

    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    setName("");
    setSlug("");
    setDesc("");
    await loadProjects();
  };

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-slate-300">
        Checking access…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
      {/* HEADER */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Signed in as <span className="text-sky-300">{userEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/analytics")}
            className="text-xs rounded-full border border-sky-500/60 px-3 py-1 hover:bg-sky-500/10 text-sky-200"
          >
            View analytics
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="text-xs rounded-full border border-white/15 px-3 py-1 hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.2fr,2fr] gap-10">
        {/* CREATE PROJECT */}
        <section className="rounded-2xl border border-white/10 bg-black/40 p-6 h-fit">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">
            Create New Project
          </h2>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 mb-1 block">Project Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100"
                placeholder="AI Resume Builder · Money Control Pro"
              />
            </div>

            <div>
              <label className="text-slate-300 mb-1 block">Slug (URL)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100"
                placeholder="ai-resume-builder"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Public waitlist will be at{" "}
                <span className="text-sky-300">/p/&lt;slug&gt;</span>
              </p>
            </div>

            <div>
              <label className="text-slate-300 mb-1 block">
                Short Description
              </label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100"
                placeholder="A short one-liner about the upcoming product."
              />
            </div>

            {error && <p className="text-red-300 text-[11px]">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create Project"}
            </button>
          </form>
        </section>

        {/* PROJECT LIST */}
        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">
            Projects
          </h2>

          {loadingProjects ? (
            <p className="text-xs text-slate-400">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-slate-400">
              No projects yet. Create your first one.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4 hover:border-sky-400/60 hover:bg-black/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-50">
                        {project.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {project.short_description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        project.is_active
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {project.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <a
                      href={`/p/${project.slug}`}
                      target="_blank"
                      className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/5"
                    >
                      View waitlist
                    </a>
                    <button
                      onClick={() =>
                        router.push(`/dashboard/${project.id}`)
                      }
                      className="rounded-full border border-sky-500/60 px-3 py-1 hover:bg-sky-500/10 text-sky-200"
                    >
                      Edit project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

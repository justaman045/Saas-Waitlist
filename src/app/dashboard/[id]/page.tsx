"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type FAQ = { q: string; a: string };

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);

  // Load project
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error(error);
      }
      setProject(data);
      setLoading(false);
    };

    load();
  }, [params.id, supabase]);

  const setField = (key: string, value: any) => {
    setProject((p: any) => ({ ...p, [key]: value }));
  };

  const updateProject = async () => {
    if (!project) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("projects")
      .update({
        name: project.name,
        slug: project.slug,
        short_description: project.short_description,
        full_description: project.full_description,
        hero_title: project.hero_title,
        hero_subtitle: project.hero_subtitle,
        features: project.features ?? [],
        faqs: project.faqs ?? [],
        gallery: project.gallery ?? [],
        external_url: project.external_url,
        github_url: project.github_url,
        is_active: project.is_active,
      })
      .eq("id", project.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
  };

  // Image upload to Supabase storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    const bucket = "project-gallery";
    const filePath = `${project.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const url = publicUrlData.publicUrl;

    setField("gallery", [...(project.gallery || []), url]);
  };

  const sendLaunchEmail = async () => {
    if (!project) return;
    setLaunching(true);
    setLaunchMessage(null);

    try {
      const res = await fetch(
        `/api/projects/${project.id}/launch-email`,
        { method: "POST" }
      );
      const body = await res.json();

      if (!res.ok) {
        setLaunchMessage("Failed: " + (body.error || "Unknown error"));
      } else {
        setLaunchMessage("Launch email sent to all waitlist users.");
      }
    } catch (err: any) {
      setLaunchMessage("Error: " + err.message);
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-16 text-slate-300">Loading project…</div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 py-16 text-red-300">Project not found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-sm">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-xs px-3 py-1 border border-white/10 rounded-lg mb-6 hover:bg-white/5"
      >
        ← Back to dashboard
      </button>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">
          Edit Project · {project.name}
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={sendLaunchEmail}
            disabled={launching}
            className="text-xs rounded-full border border-emerald-500/60 px-3 py-1 hover:bg-emerald-500/10 text-emerald-200 disabled:opacity-60"
          >
            {launching ? "Sending…" : "Send launch email"}
          </button>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <span className="text-slate-300">Active</span>
            <input
              type="checkbox"
              checked={project.is_active ?? true}
              onChange={(e) => setField("is_active", e.target.checked)}
            />
          </label>
        </div>
      </div>

      {launchMessage && (
        <p className="mb-4 text-[11px] text-sky-300">{launchMessage}</p>
      )}

      <div className="space-y-6">
        {/* GENERAL */}
        <section className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-4">
          <h2 className="text-sm font-medium text-sky-300">General</h2>

          <div>
            <label className="text-xs">Project Name</label>
            <input
              value={project.name || ""}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs">Slug</label>
            <input
              value={project.slug || ""}
              onChange={(e) => setField("slug", e.target.value)}
              className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs">Short Description</label>
            <textarea
              rows={2}
              value={project.short_description || ""}
              onChange={(e) =>
                setField("short_description", e.target.value)
              }
              className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs">Full Description</label>
            <textarea
              rows={4}
              value={project.full_description || ""}
              onChange={(e) =>
                setField("full_description", e.target.value)
              }
              className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs">External URL</label>
              <input
                value={project.external_url || ""}
                onChange={(e) =>
                  setField("external_url", e.target.value)
                }
                className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                placeholder="https://your-landing-page.com"
              />
            </div>
            <div>
              <label className="text-xs">GitHub URL</label>
              <input
                value={project.github_url || ""}
                onChange={(e) =>
                  setField("github_url", e.target.value)
                }
                className="w-full mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </section>

        {/* HERO */}
        <section className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-4">
          <h2 className="text-sm font-medium text-sky-300">Hero Section</h2>

          <input
            placeholder="Hero Title"
            value={project.hero_title || ""}
            onChange={(e) => setField("hero_title", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
          />

          <input
            placeholder="Hero Subtitle"
            value={project.hero_subtitle || ""}
            onChange={(e) => setField("hero_subtitle", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
          />
        </section>

        {/* FEATURES */}
        <section className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-4">
          <h2 className="text-sm font-medium text-sky-300">Features</h2>

          {(project.features || []).map((f: string, i: number) => (
            <input
              key={i}
              value={f}
              onChange={(e) => {
                const updated = [...(project.features || [])];
                updated[i] = e.target.value;
                setField("features", updated);
              }}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            />
          ))}

          <button
            className="text-xs px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5"
            onClick={() =>
              setField("features", [...(project.features || []), ""])
            }
          >
            + Add Feature
          </button>
        </section>

        {/* FAQ */}
        <section className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-4">
          <h2 className="text-sm font-medium text-sky-300">FAQ</h2>

          {(project.faqs || []).map((faq: FAQ, i: number) => (
            <div key={i} className="space-y-2">
              <input
                placeholder="Question"
                value={faq.q}
                onChange={(e) => {
                  const updated = [...(project.faqs || [])];
                  updated[i] = { ...updated[i], q: e.target.value };
                  setField("faqs", updated);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
              />

              <textarea
                placeholder="Answer"
                rows={2}
                value={faq.a}
                onChange={(e) => {
                  const updated = [...(project.faqs || [])];
                  updated[i] = { ...updated[i], a: e.target.value };
                  setField("faqs", updated);
                }}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
              />
            </div>
          ))}

          <button
            className="text-xs px-3 py-1 rounded-lg border border-white/10 hover:bg_WHITE/5"
            onClick={() =>
              setField("faqs", [...(project.faqs || []), { q: "", a: "" }])
            }
          >
            + Add FAQ
          </button>
        </section>

        {/* GALLERY + UPLOAD */}
        <section className="p-5 rounded-xl border border-white/10 bg-black/30 space-y-4">
          <h2 className="text-sm font-medium text-sky-300">
            Gallery & Screenshots
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-xs"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {(project.gallery || []).map((url: string, i: number) => (
              <div key={i} className="space-y-1">
                <img
                  src={url}
                  className="rounded-lg border border-white/10"
                  alt="Screenshot"
                />
                <button
                  className="text-[10px] text-red-300"
                  onClick={() => {
                    const updated = [...(project.gallery || [])];
                    updated.splice(i, 1);
                    setField("gallery", updated);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SAVE */}
        <button
          onClick={updateProject}
          disabled={saving}
          className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}

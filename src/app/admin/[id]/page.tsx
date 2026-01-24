"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type FAQ = { q: string; a: string };

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgbbUploading, setImgbbUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  // Load project
  useEffect(() => {
    const load = async () => {
      if (!params?.id || !authChecked) return;
      setLoading(true);
      try {
        const projectRef = doc(db, "projects", params.id);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          setProject({ id: projectSnap.id, ...projectSnap.data() });
        } else {
          console.error("Project not found");
        }
      } catch (err) {
        console.error("Error loading project:", err);
      }
      setLoading(false);
    };

    load();
  }, [params?.id, authChecked]);

  const setField = (key: string, value: any) => {
    setProject((p: any) => ({ ...p, [key]: value }));
  };

  const updateProject = async () => {
    if (!project || !params?.id) return;
    setSaving(true);
    setError(null);

    try {
      const projectRef = doc(db, "projects", params.id);
      await updateDoc(projectRef, {
        name: project.name ?? "",
        slug: project.slug ?? "",
        short_description: project.short_description ?? null,
        full_description: project.full_description ?? null,
        hero_title: project.hero_title ?? null,
        hero_subtitle: project.hero_subtitle ?? null,
        features: project.features ?? [],
        faqs: project.faqs ?? [],
        gallery: project.gallery ?? [],
        external_url: project.external_url ?? null,
        github_url: project.github_url ?? null,
        is_active: project.is_active ?? true,
      });
      alert("Node Synchronized Successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImgBBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!file || !project) return;
    if (!apiKey) {
      alert("Missing ImgBB API Key in .env.local. Register for free at imgbb.com/api");
      return;
    }

    setImgbbUploading(true);
    console.info(`[ImgBB] Direct transmission starting for: ${file.name}`);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const url = data.data.url;
        console.info("[ImgBB] Upload successful:", url);
        setField("gallery", [...(project.gallery || []), url]);
      } else {
        throw new Error(data.error?.message || "ImgBB transmission failed.");
      }
    } catch (err: any) {
      console.error("[ImgBB] Error:", err);
      alert("Public Upload Failed: " + err.message);
    } finally {
      setImgbbUploading(false);
    }
  };

  // Image upload to Firebase storage with diagnostic tracking
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploading(true);
    console.info(`[Storage] Initializing upload for: ${file.name} (${file.size} bytes)`);

    try {
      const storagePath = `project-gallery/${project.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // Diagnostic Timeout (30s)
      const timeout = setTimeout(() => {
        console.error("[Storage] Upload timed out after 30s. Check security rules or network.");
        uploadTask.cancel();
        setUploading(false);
        alert("Upload Timed Out. Please check your connection or console for details.");
      }, 30000);

      uploadTask.on('state_changed',
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.info(`[Storage] Upload Progress: ${Math.round(progress)}%`);
        },
        (err: any) => {
          clearTimeout(timeout);
          console.error("[Storage] Upload Error:", err);
          alert(`Upload failed: ${err.message}`);
          setUploading(false);
        },
        async () => {
          clearTimeout(timeout);
          console.info("[Storage] Upload Complete. Resolving URL...");
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.info("[Storage] URL Resolved:", url);
          setField("gallery", [...(project.gallery || []), url]);
          setUploading(false);
        }
      );

    } catch (err: any) {
      console.error("[Storage] Initialization Error:", err);
      alert("Failed to initialize upload: " + err.message);
      setUploading(false);
    }
  };

  const deleteGalleryImage = async (url: string, index: number) => {
    if (!window.confirm("Confirm deletion of visual asset?")) return;

    try {
      // Best effort to delete from storage if it's our own URL
      if (url.includes("firebasestorage.googleapis.com")) {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef).catch(e => console.warn("Storage deletion failed:", e));
      }

      const updated = [...(project.gallery || [])];
      updated.splice(index, 1);
      setField("gallery", updated);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };



  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass p-8 rounded-3xl animate-pulse text-foreground/60 text-xs font-bold tracking-widest uppercase">
          Loading project data...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass p-8 rounded-3xl border-red-500/20 text-red-500 text-xs font-bold tracking-widest uppercase">
          Error: Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto animate-fade-in text-sm">

        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/admin")}
              className="group flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest mb-4"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
            </button>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-card-border flex items-center justify-center text-xl shadow-inner">
                ⚙️
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground italic">
                {project.name} <span className="text-foreground/40 font-medium not-italic ml-2">Editor</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-10 w-px bg-foreground/5 mx-1 hidden md:block" />
            <label className="flex items-center gap-3 glass px-5 py-3 rounded-2xl cursor-pointer hover:bg-foreground/5 transition-all">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Visibilty:</span>
              <input
                type="checkbox"
                checked={project.is_active ?? true}
                onChange={(e) => setField("is_active", e.target.checked)}
                className="accent-accent-emerald w-4 h-4"
              />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${project.is_active ? 'text-accent-emerald' : 'text-red-500'}`}>
                {project.is_active ? 'Published' : 'Draft'}
              </span>
            </label>
          </div>
        </div>

        {/* MAIN CONFIG GRID */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: PRIMARY CONFIG */}
          <div className="lg:col-span-2 space-y-8">

            {/* SECTION: GENERAL DATA */}
            <section className="glass p-8 rounded-[3rem] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-sky/5 blur-[40px] pointer-events-none opacity-50" />
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Project Overview</h2>
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">General</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Project Name</label>
                  <input
                    value={project.name || ""}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all shadow-inner"
                    placeholder="E.g. My Awesome SaaS"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Unique Slug (URL)</label>
                  <input
                    readOnly
                    value={project.slug || ""}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground/30 font-mono shadow-inner cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Tagline (Short Brief)</label>
                <textarea
                  rows={2}
                  value={project.short_description || ""}
                  onChange={(e) => setField("short_description", e.target.value)}
                  className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all resize-none font-normal shadow-inner leading-relaxed"
                  placeholder="One sentence about your project..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Full Project Description</label>
                <textarea
                  rows={6}
                  value={project.full_description || ""}
                  onChange={(e) => setField("full_description", e.target.value)}
                  className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all resize-none font-normal leading-relaxed shadow-inner"
                  placeholder="Describe your project in detail..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">External Link</label>
                  <input
                    value={project.external_url || ""}
                    onChange={(e) => setField("external_url", e.target.value)}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground/60 focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all text-xs shadow-inner"
                    placeholder="https://yourapp.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">GitHub Repository</label>
                  <input
                    value={project.github_url || ""}
                    onChange={(e) => setField("github_url", e.target.value)}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-foreground/60 focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all text-xs shadow-inner"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>
            </section>

            {/* SECTION: FEATURES */}
            <section className="glass p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Core Features</h2>
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Showcase List</span>
              </div>

              <div className="space-y-4">
                {(project.features || []).map((f: string, i: number) => (
                  <div key={i} className="group relative flex items-center gap-4 animate-fade-in translate-y-0 hover:-translate-y-1 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-card-border flex items-center justify-center text-[10px] font-bold text-foreground/40 group-hover:text-accent-sky group-hover:bg-accent-sky/5 transition-all">
                      {i + 1}
                    </div>
                    <input
                      value={f}
                      onChange={(e) => {
                        const updated = [...(project.features || [])];
                        updated[i] = e.target.value;
                        setField("features", updated);
                      }}
                      className="flex-1 rounded-2xl border border-card-border bg-foreground/5 px-6 py-4 text-sm text-foreground focus:border-accent-sky/30 focus:bg-foreground/10 outline-none transition-all shadow-inner"
                      placeholder="Add a key feature..."
                    />
                    <button
                      onClick={() => {
                        const updated = [...(project.features || [])];
                        updated.splice(i, 1);
                        setField("features", updated);
                      }}
                      className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500 flex items-center justify_center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                      title="Remove Feature"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="w-full py-5 rounded-[1.5rem] border border-dashed border-card-border text-foreground/30 hover:text-foreground hover:bg-foreground/5 hover:border-foreground/20 transition-all text-[11px] font-bold uppercase tracking-[0.2em]"
                onClick={() => setField("features", [...(project.features || []), ""])}
              >
                + Add Feature Item
              </button>
            </section>

            {/* SECTION: PROTOCOL FAQ */}
            <section className="glass p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <h2 className="text-xl font-bold text-foreground italic">Project Intel (FAQ)</h2>
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Query Matrix</span>
              </div>

              <div className="space-y-6">
                {(project.faqs || []).map((faq: FAQ, i: number) => (
                  <div key={i} className="group glass p-6 rounded-[2rem] bg-foreground/[0.02] border-card-border flex flex-col gap-4 relative animate-fade-in order-last">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent-sky/60">Query Node {i + 1}</span>
                      <button
                        onClick={() => {
                          const updated = [...(project.faqs || [])];
                          updated.splice(i, 1);
                          setField("faqs", updated);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/10 text-red-500 text-xs flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      value={faq.q}
                      onChange={(e) => {
                        const updated = [...(project.faqs || [])];
                        updated[i].q = e.target.value;
                        setField("faqs", updated);
                      }}
                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-foreground placeholder:text-foreground/10 outline-none"
                      placeholder="Transmission Question?"
                    />
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const updated = [...(project.faqs || [])];
                        updated[i].a = e.target.value;
                        setField("faqs", updated);
                      }}
                      className="w-full bg-transparent border-none p-0 text-xs text-foreground/60 placeholder:text-foreground/10 outline-none resize-none font-light italic leading-relaxed"
                      placeholder="Intelligence Response Data..."
                    />
                  </div>
                ))}
              </div>
              <button
                className="w-full py-5 rounded-[1.5rem] border border-dashed border-card-border text-foreground/40 hover:text-foreground hover:bg-foreground/5 hover:border-foreground/20 transition-all text-[11px] font-bold uppercase tracking-[0.3em] bg-foreground/[0.01]"
                onClick={() => setField("faqs", [...(project.faqs || []), { q: "", a: "" }])}
              >
                + Register Intelligence Entry
              </button>
            </section>
          </div>

          {/* RIGHT COLUMN: VISUALS & DISPLAY */}
          <div className="space-y-8">

            {/* SECTION: HERO CONFIG */}
            <section className="glass p-8 rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">Hero Section Content</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Hero Headline</label>
                  <input
                    placeholder="The main title on your landing page"
                    value={project.hero_title || ""}
                    onChange={(e) => setField("hero_title", e.target.value)}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-5 py-4 text-xs text-foreground outline-none focus:border-accent-sky/30 shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Hero Description</label>
                  <textarea
                    rows={4}
                    placeholder="Short mission statement"
                    value={project.hero_subtitle || ""}
                    onChange={(e) => setField("hero_subtitle", e.target.value)}
                    className="w-full rounded-2xl border border-card-border bg-foreground/5 px-5 py-4 text-xs text-foreground outline-none focus:border-accent-sky/30 resize-none font-normal leading-relaxed shadow-inner"
                  />
                </div>
              </div>
            </section>

            {/* SECTION: GALLERY */}
            <section className="glass p-8 rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">Project Gallery</h2>
              </div>

              {/* URL INJECTION (FREE WORKAROUND) */}
              <div className="space-y-5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">Import via Image URL (Free Hosting)</label>
                <div className="flex flex-col gap-3">
                  <input
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl || ""}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-card-border bg-foreground/5 px-5 py-4 text-[10px] text-foreground outline-none focus:border-accent-sky/30 shadow-inner"
                  />
                  <button
                    onClick={() => {
                      if (!newImageUrl) return;
                      setField("gallery", [...(project.gallery || []), newImageUrl]);
                      setNewImageUrl("");
                    }}
                    className="w-full py-4 rounded-xl bg-accent-sky/10 border border-accent-sky/20 text-accent-sky text-[10px] font-bold uppercase tracking-widest hover:bg-accent-sky hover:text-white transition-all"
                  >
                    Import Asset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 opacity-20">
                <div className="h-px flex-1 bg-foreground/5" />
                <span className="text-[8px] font-bold text-foreground/70 uppercase tracking-[0.4em]">OR</span>
                <div className="h-px flex-1 bg-foreground/5" />
              </div>

              {/* UPLOAD MODES */}
              <div className="grid grid-cols-1 gap-6">
                <label className="flex flex-col items-center justify-center py-12 rounded-[2.5rem] border-2 border-dashed border-accent-emerald/20 bg-accent-emerald/[0.02] hover:bg-accent-emerald/5 hover:border-accent-emerald/40 cursor-pointer transition-all group relative overflow-hidden">
                  {imgbbUploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 animate-fade-in">
                      <div className="w-6 h-6 border-2 border-accent-emerald/20 border-t-accent-emerald rounded-full animate-spin" />
                    </div>
                  )}
                  <span className="text-3xl mb-4 group-hover:scale-110 transition-transform">🚀</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-emerald/80 text-center px-8 leading-relaxed">Free Cloud Upload <br /><span className="text-[8px] font-normal opacity-50">via ImgBB Integration</span></span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImgBBUpload}
                    className="hidden"
                    disabled={imgbbUploading}
                  />
                </label>

                <div className="flex items-center gap-4 py-2 opacity-10">
                  <div className="h-px flex-1 bg-foreground/5" />
                  <span className="text-[8px] font-bold text-foreground uppercase tracking-[0.3em]">SECURE ADMID STORAGE</span>
                  <div className="h-px flex-1 bg-foreground/5" />
                </div>

                <label className="w-full flex flex-col items-center justify-center py-8 rounded-[2.5rem] border-2 border-dashed border-card-border hover:bg-foreground/5 hover:border-foreground/10 cursor-pointer transition-all group relative overflow-hidden text-foreground/5">
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 animate-fade-in">
                      <div className="w-6 h-6 border-2 border-accent-sky/20 border-t-accent-sky rounded-full animate-spin" />
                    </div>
                  )}
                  <span className="text-xl mb-3 grayscale group-hover:grayscale-0 transition-opacity opacity-20">📸</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-center px-6">Firebase Storage (Standard)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-8">
                {(project.gallery || []).map((url: string, i: number) => (
                  <div key={i} className="group relative aspect-video rounded-[2rem] overflow-hidden glass border-card-border shadow-2xl">
                    <img
                      src={url}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      alt="Gallery Asset"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-5 py-2.5 rounded-full border border-red-500/20 hover:bg-red-500/30 transition-all backdrop-blur-md"
                        onClick={() => deleteGalleryImage(url, i)}
                      >
                        Remove Asset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* PERSISTENT ACTIONS */}
        <div className="mt-20 pt-16 border-t border-card-border flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-sky/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400/30" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30 italic">Ready to publish</p>
          </div>

          <button
            onClick={updateProject}
            disabled={saving}
            className="w-full max-w-2xl py-6 rounded-[2.5rem] bg-foreground text-background font-bold uppercase tracking-[0.3em] text-xs hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-sky-500/10 flex items-center justify-center gap-4 disabled:opacity-50 border-b-4 border-background/10"
          >
            {saving ? "🔄 Saving Project Changes..." : "💾 Save Project Changes"}
          </button>
          {error && (
            <div className="px-6 py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold tracking-widest text-[10px] uppercase animate-pulse">
              Error Profile: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

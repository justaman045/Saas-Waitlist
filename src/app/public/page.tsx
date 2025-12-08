"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type PublicProject = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
};

export default function PublicWaitlistsPage() {
  const supabase = createSupabaseBrowserClient();
  const [projects, setProjects] = useState<PublicProject[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug, short_description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setProjects(data ?? []);
    };

    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-sm">
      <h1 className="text-3xl font-bold text-white mb-6">Public Waitlists</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/p/${p.slug}`}
            className="block p-5 rounded-xl bg-black/30 border border-white/10 hover:border-sky-500/40 transition"
          >
            <h2 className="text-xl font-semibold text-white">{p.name}</h2>
            <p className="text-slate-300 text-xs mt-2">
              {p.short_description || "No description available."}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

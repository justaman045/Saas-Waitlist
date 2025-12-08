"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function PublicWaitlistsPage() {
  const supabase = createSupabaseBrowserClient();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, name, slug, short_description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setProjects(data || []);
    };

    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-sm">
      <h1 className="text-3xl font-bold text-white mb-6">
        Public Waitlists
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p: any) => (
          <Link
            key={p.id}
            href={`/p/${p.slug}`}
            className="p-5 rounded-xl border border-white/10 bg-black/30 hover:bg-black/40"
          >
            <p className="text-lg font-medium">{p.name}</p>
            <p className="text-xs text-slate-400 mt-2">{p.short_description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

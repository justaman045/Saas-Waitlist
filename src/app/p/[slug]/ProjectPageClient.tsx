// app/p/[slug]/ProjectPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Project = {
  id: string;
  name: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  short_description: string | null;
  full_description: string | null;
  features: string[] | null;
  gallery: string[] | null;
  faqs: { q: string; a: string }[] | null;
};

type State = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  position?: number;
  referralCode?: string;
};

function generateReferralCode() {
  return (
    Math.random().toString(36).substring(2, 8) +
    Date.now().toString(36).slice(-3)
  );
}

type Props = {
  slug: string;
};

export default function ProjectPageClient({ slug }: Props) {
  const searchParams = useSearchParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [baseUrl, setBaseUrl] = useState("");

  const referrerCode = searchParams.get("ref");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
  .from("projects")
  .select(`
    id,
    name,
    slug,
    hero_title,
    hero_subtitle,
    short_description,
    full_description,
    features,
    gallery,
    faqs
  `)
  .eq("slug", slug)
  .eq("is_active", true)
  .single();

console.log("Loaded project:", data, error);


      setProject(error ? null : data);
      setLoadingProject(false);
    };

    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setState({ status: "loading" });
    const supabase = createSupabaseBrowserClient();

    const { data: existing } = await supabase
      .from("waitlist_entries")
      .select("id, position, referral_code")
      .eq("project_id", project.id)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      setState({
        status: "success",
        message: "You’re already on the waitlist.",
        position: existing.position,
        referralCode: existing.referral_code,
      });
      return;
    }

    const { count } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id);

    const position = (count ?? 0) + 1;
    const referralCode = generateReferralCode();

    await supabase.from("waitlist_entries").insert({
      project_id: project.id,
      email: email.toLowerCase(),
      name,
      position,
      referral_code: referralCode,
      referred_by: referrerCode || null,
    });

    setState({
      status: "success",
      message: "You're on the waitlist!",
      position,
      referralCode,
    });
  };

  if (loadingProject) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-slate-300">
        Loading…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-red-300">
        This waitlist does not exist.
      </div>
    );
  }

  const shareLink =
    state.referralCode && baseUrl
      ? `${baseUrl}/p/${slug}?ref=${state.referralCode}`
      : "";

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-200">
      {/* HERO SECTION */}
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-[11px] text-sky-300 mb-3">
            🚀 Early Access · {project.name}
          </p>

          <h1 className="text-4xl font-semibold text-white mb-4">
            {project.hero_title || `Join the waitlist for ${project.name}`}
          </h1>

          <p className="text-slate-300 mb-6">
            {project.hero_subtitle || project.short_description}
          </p>

          {project.full_description && (
            <p className="text-slate-400 mb-8 leading-relaxed">
              {project.full_description}
            </p>
          )}

          {/* FEATURES */}
          {project.features && project.features.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feature, i) => (
                <div
                  key={i}
                  className="border border-white/10 bg-black/30 rounded-xl p-4 text-xs"
                >
                  <p className="text-sky-300 font-medium mb-1">
                    Feature {i + 1}
                  </p>
                  {feature}
                </div>
              ))}
            </div>
          )}

          {/* GALLERY */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="mt-12">
              <p className="text-sm font-medium text-slate-300 mb-3">
                Screenshots
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className="rounded-xl border border-white/10 shadow"
                    alt=""
                  />
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {project.faqs && project.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-white mb-4">FAQ</h2>

              {project.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="p-4 mb-3 rounded-xl border border-white/10 bg-black/20 cursor-pointer"
                >
                  <summary className="text-sm text-sky-300 font-medium">
                    {faq.q}
                  </summary>
                  <p className="text-xs text-slate-300 mt-2">{faq.a}</p>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* JOIN WAITLIST FORM */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl h-fit sticky top-20">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="text-xs">Name</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs">Email</label>
              <input
                required
                type="email"
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-sky-500 hover:bg-sky-400 text-black rounded-lg py-2 font-semibold"
              disabled={state.status === "loading"}
            >
              {state.status === "loading" ? "Joining…" : "Join Waitlist"}
            </button>

            {state.message && (
              <p
                className={`text-xs ${
                  state.status === "error" ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {state.message}{" "}
                {state.position && <span>· Position #{state.position}</span>}
              </p>
            )}
          </form>

          {state.status === "success" && shareLink && (
            <div className="mt-5 p-3 border border-sky-500/40 bg-sky-500/10 rounded-xl text-[11px] text-sky-200">
              <p className="font-semibold mb-1">Boost your position</p>
              <p className="mb-2">
                Share your link. More referrals = better perks later.
              </p>
              <input
                readOnly
                value={shareLink}
                className="w-full text-[10px] bg-black/40 px-2 py-1 rounded border border-white/10"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

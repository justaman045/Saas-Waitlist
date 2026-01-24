"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, addDoc, getCountFromServer, serverTimestamp, orderBy } from "firebase/firestore";

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
  referrals?: Array<{ name: string; created_at: any }>;
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

  // ----- SESSION PERSISTENCE HELPERS -----
  const getStoredEmail = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`pn_session_${slug}`);
  };

  const setStoredEmail = (storedEmail: string) => {
    localStorage.setItem(`pn_session_${slug}`, storedEmail);
  };

  const clearSession = () => {
    localStorage.removeItem(`pn_session_${slug}`);
    setState({ status: "idle" });
    setEmail("");
    setName("");
  };

  // ----- FETCH REFERRALS -----
  const fetchReferrals = async (code: string) => {
    try {
      const q = query(
        collection(db, "waitlist_entries"),
        where("referred_by", "==", code),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({
        name: doc.data().name,
        created_at: doc.data().created_at
      }));
    } catch (err) {
      console.error("Referral fetch failed:", err);
      return [];
    }
  };

  // ----- AUTO-LOGIN LOGIC -----
  useEffect(() => {
    const autoLogin = async () => {
      const cachedEmail = getStoredEmail();
      if (!cachedEmail || !project) return;

      setState({ status: "loading" });
      try {
        const q = query(
          collection(db, "waitlist_entries"),
          where("project_id", "==", project.id),
          where("email", "==", cachedEmail.toLowerCase()),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const refs = await fetchReferrals(data.referral_code);
          setState({
            status: "success",
            message: "Welcome back to the stream.",
            position: data.position,
            referralCode: data.referral_code,
            referrals: refs
          });
        } else {
          // Cache is stale or project data changed
          clearSession();
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
        setState({ status: "idle" });
      }
    };

    if (project) autoLogin();
  }, [project]);

  // ----- LOAD PROJECT -----
  useEffect(() => {
    const load = async () => {
      setLoadingProject(true);
      try {
        const q = query(
          collection(db, "projects"),
          where("slug", "==", slug),
          where("is_active", "==", true),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setProject({ id: doc.id, ...doc.data() } as Project);
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error("Error loading project:", err);
        setProject(null);
      }
      setLoadingProject(false);
    };

    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setState({ status: "loading" });

    try {
      const qExisting = query(
        collection(db, "waitlist_entries"),
        where("project_id", "==", project.id),
        where("email", "==", email.toLowerCase()),
        limit(1)
      );
      const existingSnap = await getDocs(qExisting);

      if (!existingSnap.empty) {
        const existingData = existingSnap.docs[0].data();
        const refs = await fetchReferrals(existingData.referral_code);
        setStoredEmail(email.toLowerCase());
        setState({
          status: "success",
          message: "You’re already in sync with this node.",
          position: existingData.position,
          referralCode: existingData.referral_code,
          referrals: refs
        });
        return;
      }

      const qCount = query(
        collection(db, "waitlist_entries"),
        where("project_id", "==", project.id)
      );
      const countSnap = await getCountFromServer(qCount);
      const position = countSnap.data().count + 1;
      const referralCode = generateReferralCode();

      // Capture Source Intelligence
      const sourceUrl = document.referrer || "direct";
      const utmSource = searchParams.get("utm_source") || null;
      const utmMedium = searchParams.get("utm_medium") || null;
      const utmCampaign = searchParams.get("utm_campaign") || null;

      await addDoc(collection(db, "waitlist_entries"), {
        project_id: project.id,
        project_slug: slug,
        project_name: project.name,
        email: email.toLowerCase(),
        name,
        position,
        referral_code: referralCode,
        referred_by: referrerCode || null,
        source_url: sourceUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        created_at: serverTimestamp(),
      });

      const refs = await fetchReferrals(referralCode);
      setStoredEmail(email.toLowerCase());

      setState({
        status: "success",
        message: "Node integration successful.",
        position,
        referralCode,
        referrals: refs
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      setState({ status: "error", message: "Transmission failed. Recalibrate and try again." });
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass p-8 rounded-3xl animate-pulse text-foreground/50 text-sm tracking-widest uppercase">
          Synthesizing Project Data...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass p-8 rounded-3xl border-red-500/20 text-red-400 text-sm tracking-widest uppercase">
          Error: Unauthorized Access or Node Offline.
        </div>
      </div>
    );
  }

  const shareLink =
    state.referralCode && baseUrl
      ? `${baseUrl}/p/${slug}?ref=${state.referralCode}`
      : "";

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 bg-background overflow-hidden relative">

      {/* CINEMATIC BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-accent-sky/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] bg-accent-emerald/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-orange-500/[0.03] rounded-full blur-[100px] animate-float" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-[1fr,460px] gap-16 lg:items-center mb-32 animate-fade-in text-balance">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-sky/10 border border-accent-sky/20 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-sky shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                <span className="text-accent-sky text-[10px] font-bold uppercase tracking-[0.2em]">Exclusive Early Access</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                {project.hero_title || `Discover ${project.name}`}
              </h1>
              <p className="text-xl md:text-2xl text-white/50 font-medium leading-relaxed max-w-2xl border-l-4 border-accent-sky/20 pl-8 mt-8">
                {project.hero_subtitle || project.short_description || "Empowering the next generation of digital excellence."}
              </p>
            </div>

            {project.full_description && (
              <div className="relative group">
                <div className="glass p-10 rounded-[2.5rem] bg-white/[0.02] border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-sky/5 blur-3xl opacity-50" />
                  <p className="text-white/70 leading-relaxed font-normal whitespace-pre-line text-sm md:text-lg">
                    {project.full_description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIGNUP/SUCCESS MODULE */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="glass p-10 md:p-12 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden border-t-accent-sky/20 border-t-2 backdrop-blur-[100px]">
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-accent-sky/10 blur-[80px] pointer-events-none" />

              <div className="mb-10 flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Reserve Your Spot</h2>
                  <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-semibold mt-2">Join the priority access list</p>
                </div>
                {state.status === "success" && (
                  <button
                    onClick={clearSession}
                    title="Change Account"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
                  >
                    <span className="text-white/40 group-hover:text-white transition-colors text-sm">🔄</span>
                  </button>
                )}
              </div>

              {state.status === "success" ? (
                <div className="space-y-8 animate-fade-in text-center lg:text-left">
                  <div className="p-8 rounded-[2rem] bg-accent-emerald/5 border border-accent-emerald/20 shadow-inner">
                    <div className="w-16 h-16 rounded-2xl bg-accent-emerald/10 flex items-center justify-center text-3xl mx-auto lg:mx-0 mb-6 shadow-xl shadow-accent-emerald/10 border border-accent-emerald/20">✨</div>
                    <h3 className="text-accent-emerald font-bold uppercase tracking-widest text-xs mb-2">Registration Successful</h3>
                    <p className="text-white/50 text-[11px] font-medium">
                      You've secured your position in the waitlist.<br />
                      Current Rank: <span className="text-white font-bold text-xl ml-1">#{state.position}</span>
                    </p>
                  </div>

                  {shareLink && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-sky ml-2">Boost Your Rank</p>
                        <div className="glass p-6 rounded-[2rem] bg-white/[0.03] border-accent-sky/10">
                          <p className="text-[10px] text-white/40 mb-4 font-normal leading-relaxed text-center lg:text-left">Share your unique link. For every person who joins, you'll move up in line.</p>
                          <div className="relative group">
                            <input
                              readOnly
                              value={shareLink}
                              className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-[10px] text-accent-sky font-mono transition-all group-hover:border-accent-sky/30 outline-none"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shareLink);
                                alert("Referral Link Copied.");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-sky/10 hover:bg-accent-sky/20 px-4 py-2 rounded-lg text-[9px] font-bold tracking-widest uppercase text-accent-sky transition-all backdrop-blur-md border border-accent-sky/20"
                            >
                              COPY
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* REFERRAL NETWORK DISPLAY */}
                      <div className="space-y-4 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between px-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Your Referrals</h4>
                          <span className="px-3 py-1 rounded-full bg-accent-sky/10 text-accent-sky text-[9px] font-bold border border-accent-sky/20">{state.referrals?.length || 0}</span>
                        </div>
                        <div className="space-y-3">
                          {state.referrals && state.referrals.length > 0 ? (
                            state.referrals.map((r, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in group hover:bg-white/5 transition-colors" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-accent-sky/10 border border-accent-sky/20 flex items-center justify-center text-[10px] text-accent-sky font-bold">
                                    {r.name.charAt(0)}
                                  </div>
                                  <span className="text-[11px] font-medium text-white/60">
                                    {r.name.split(' ').map(part => part.charAt(0) + '***').join(' ')} joined
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-accent-emerald uppercase tracking-widest">+1 Spot</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-10 rounded-[2rem] border-2 border-dashed border-white/5 text-center bg-white/[0.01]">
                              <p className="text-[11px] text-white/20 font-medium">No referrals yet. <br />Invite friends to skip the queue!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2">Full Name</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-accent-sky/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/10 shadow-inner"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-accent-sky/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/10 shadow-inner"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={state.status === "loading"}
                      className="group w-full rounded-2xl bg-white py-5 text-[12px] font-bold uppercase tracking-[0.2em] text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {state.status === "loading" ? "Processing..." : (
                        <>
                          Join the Waitlist
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-white/20 mt-6 font-semibold uppercase tracking-[0.1em]">
                      Be among the first to experience {project.name}.
                    </p>
                  </div>

                  {state.status === "error" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
                      ⚠️ {state.message}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* SECONDARY CONTENT MATRIX */}
        <div className="grid lg:grid-cols-2 gap-20">
          {project.features && project.features.length > 0 && (
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Core Features</h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid gap-6">
                {project.features.map((feature, i) => (
                  <div key={i} className="glass p-8 rounded-[2rem] hover:bg-white/[0.03] border-white/5 flex gap-8 items-start group relative overflow-hidden transition-all duration-500">
                    <div className="w-12 h-12 rounded-xl bg-accent-sky/5 border border-white/5 flex-shrink-0 flex items-center justify-center text-lg font-bold text-accent-sky shadow-inner group-hover:border-accent-sky/30 transition-all">
                      {i + 1}
                    </div>
                    <p className="text-white/60 text-lg leading-relaxed font-normal py-1">{feature}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Gallery</h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.gallery.map((img, idx) => (
                  <div key={idx} className="group relative aspect-video rounded-[2.5rem] overflow-hidden glass border-white/5 shadow-2xl">
                    <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Preview" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.faqs && project.faqs.length > 0 && (
            <section className="lg:col-span-2 space-y-12 mt-20">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white tracking-tight">Common Questions</h2>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">Frequently Asked Questions</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {project.faqs.map((faq, i) => (
                  <div key={i} className="glass p-10 rounded-[2.5rem] bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all group">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-accent-sky/10 border border-accent-sky/20 flex items-center justify-center text-accent-sky text-[10px] font-bold">Q</div>
                      <h3 className="text-white font-bold text-lg group-hover:text-accent-sky transition-colors leading-tight">{faq.q}</h3>
                    </div>
                    <div className="flex items-start gap-4 pl-12 border-l-2 border-white/5">
                      <p className="text-white/40 text-sm leading-relaxed font-normal">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-48 pt-24 border-t border-white/5 flex flex-col items-center text-center">
          <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.5em] mb-4">Project ID: {project.id}</p>
          <div className="flex items-center gap-4 text-white/5 font-semibold uppercase tracking-widest text-[9px]">
            <span>System Online</span>
            <span className="w-8 h-[1px] bg-white/5" />
            <span>Deployment Pending</span>
          </div>
        </div>

      </div>
    </div>
  );
}

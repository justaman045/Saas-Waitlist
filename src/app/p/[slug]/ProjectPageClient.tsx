"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
            message: "Welcome back.",
            position: data.position,
            referralCode: data.referral_code,
            referrals: refs
          });
        } else {
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
          message: "You're already on the list.",
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
        message: "Successfully joined.",
        position,
        referralCode,
        referrals: refs
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      setState({ status: "error", message: "Failed to join. Please try again." });
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm font-mono text-red-500">
        Error: Project not found.
      </div>
    );
  }

  const shareLink =
    state.referralCode && baseUrl
      ? `${baseUrl}/p/${slug}?ref=${state.referralCode}`
      : "";

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 bg-grid-small opacity-[0.05] pointer-events-none" />

      <div className="lg:grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">

        {/* LEFT COLUMN: STICKY INFO */}
        <div className="relative p-8 md:p-12 lg:p-16 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:flex lg:flex-col lg:justify-between border-r border-card-border bg-card/30 backdrop-blur-sm">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-secondary/30 bg-accent-secondary/5 text-accent-primary text-[10px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
              Waitlist Active
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-balance">
                {project.name}
              </h1>
              <p className="text-xl md:text-2xl text-foreground/60 font-medium leading-relaxed max-w-xl text-balance">
                {project.hero_title || project.short_description || "Building the next generation of software."}
              </p>
            </div>

            {project.features && project.features.length > 0 && (
              <div className="hidden lg:grid gap-4 pt-8">
                {project.features.slice(0, 3).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background text-[10px]">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:block pt-12 text-xs font-mono text-foreground/40">
            [ PROJECT_ID: {project.id.slice(0, 8)} ]
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & CONTENT */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col gap-12 lg:gap-24 overflow-y-auto">

          {/* WAITLIST FORM */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <div className="mb-8">
              <h2 className="text-xl font-semibold tracking-tight mb-2">Reserve Access</h2>
              <p className="text-foreground/60 text-sm">Join {state.position ? "the queue" : "the exclusive list"} for early access.</p>
            </div>

            {state.status === "success" ? (
              <div className="p-8 border border-card-border bg-foreground/5 rounded-xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground text-background text-xl">🎉</div>
                  <div>
                    <div className="text-lg font-bold">You're on the list.</div>
                    <div className="text-sm text-foreground/60">Rank: <span className="font-mono font-bold">#{state.position}</span></div>
                  </div>
                </div>

                {shareLink && (
                  <div className="space-y-3 pt-4 border-t border-card-border/50">
                    <p className="text-xs font-mono uppercase tracking-widest text-foreground/50">Refer & Skip Queue</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-3 bg-background border border-card-border rounded-lg text-xs font-mono truncate">
                        {shareLink}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(shareLink); alert("Copied") }}
                        className="px-4 py-2 border border-card-border hover:bg-foreground hover:text-background transition-colors rounded-lg text-xs font-bold uppercase"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-1.5 block">Full Name</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-card-border py-2 text-foreground focus:border-foreground outline-none transition-colors rounded-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-1.5 block">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-card-border py-2 text-foreground focus:border-foreground outline-none transition-colors rounded-none"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state.status === "loading"}
                  className="w-full py-4 bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                >
                  {state.status === "loading" ? "Processing..." : "Join Waitlist →"}
                </button>
              </form>
            )}
          </div>

          {/* GALLERY */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/40 border-b border-card-border pb-2">Interface Preview</h3>
              <div className="grid gap-8">
                {project.gallery.map((img, i) => (
                  <div key={i} className="relative aspect-video border border-card-border bg-card/50 overflow-hidden">
                    <Image
                      src={img}
                      fill
                      unoptimized
                      className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100"
                      alt="Preview"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {project.faqs && project.faqs.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/40 border-b border-card-border pb-2">Details</h3>
              <div className="space-y-8">
                {project.faqs.map((faq, i) => (
                  <div key={i}>
                    <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
                    <p className="text-foreground/70 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-24 border-t border-card-border mt-auto">
            <div className="flex items-center gap-4 text-xs text-foreground/40 font-mono">
              <Link href="/" className="hover:text-foreground transition-colors">Project Notify</Link>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

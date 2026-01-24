"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="relative w-full max-w-[440px] animate-fade-in">

        {/* BACKGROUND GLOW */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent-sky/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-emerald/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">

          {/* LOGO AREA */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner mb-6">
              🔐
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white text-center">Admin Portal</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2.5 text-center">
              Manage your waitlist campaigns
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-accent-sky/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/10 shadow-inner"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 ml-2">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-accent-sky/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/10 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Login failed: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[2rem] bg-white text-black py-5 mt-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 border-b-4 border-black/10"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-white/20 font-medium uppercase tracking-[0.3em]">
              Secure administrative access only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

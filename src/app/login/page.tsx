// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-2">Admin login</h1>
        <p className="text-xs text-slate-400 mb-6">
          Sign in to access your Waitlist Studio dashboard.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="text-xs text-slate-300 mb-1 block">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 mb-1 block">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-slate-100"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 py-2 text-xs font-semibold text-black hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

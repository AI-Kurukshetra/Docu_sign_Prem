'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-indigo-100 ring-1 ring-white/10 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.2em]">DocuSign Clone</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-indigo-100/80 text-sm">
            Securely send and sign documents with a lightweight flow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 rounded-2xl shadow-2xl border border-white/40 backdrop-blur-xl p-8 space-y-5"
        >
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode((prev) => (prev === "login" ? "signup" : "login"))
            }
            className="w-full border border-indigo-200 text-indigo-700 py-3 rounded-xl font-medium hover:bg-indigo-50 transition disabled:opacity-60"
            disabled={loading}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Have an account? Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

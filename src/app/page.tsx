import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const ctaHref = session ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold">
              DS
            </div>
            <div className="text-lg font-semibold">DocuSign Clone</div>
          </div>
          <Link
            href={ctaHref}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:scale-[1.02] transition"
          >
            {session ? "Go to Dashboard" : "Login / Sign up"}
          </Link>
        </header>

        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.25em] text-indigo-200">
              Modern e-signatures
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Send, sign, and finish documents fast.
            </h1>
            <p className="text-indigo-100/80 text-lg">
              Upload PDFs, invite recipients, capture signatures, and deliver a final signed copy—fast, secure, and mobile-friendly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:translate-y-[-1px] transition"
              >
                {session ? "Open Dashboard" : "Start free"}
              </Link>
              <a
                href="#features"
                className="px-5 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition"
              >
                See features
              </a>
            </div>
            <div className="flex gap-6 text-sm text-indigo-100/80">
              <span>✓ Secure storage</span>
              <span>✓ Tokenized sign links</span>
              <span>✓ Final PDF output</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/40 to-sky-500/40 -z-10" />
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl shadow-slate-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-indigo-100/80">Recent activity</div>
                  <div className="text-xl font-semibold">Signed NDA</div>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
                  completed
                </span>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Employment Agreement</span>
                  <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 text-xs">
                    sent
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Contractor SOW</span>
                  <span className="px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 text-xs">
                    draft
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Offer Letter</span>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 text-xs">
                    completed
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Metric label="Avg. completion" value="6m" />
                <Metric label="Docs sent" value="24" />
                <Metric label="Final PDFs" value="24" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          <Feature title="Upload & send" desc="Add documents, assign recipients, and dispatch sign requests in seconds." />
          <Feature title="Token sign links" desc="Share unique, secure signing links per recipient with activity tracking." />
          <Feature title="Final PDF" desc="Flattened, signed PDF ready to download, share, or archive." />
        </section>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-xl shadow-slate-900/30">
      <div className="text-lg font-semibold mb-2">{title}</div>
      <p className="text-indigo-100/80 text-sm">{desc}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-xs text-indigo-100/70 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

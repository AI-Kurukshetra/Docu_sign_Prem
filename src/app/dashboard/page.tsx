import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { EnvelopesBoard, type Envelope } from "./EnvelopesBoard";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: envelopes } = await supabase
    .from("envelopes")
    .select("id,title,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-900/70 shadow-2xl shadow-slate-900/40 px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-indigo-100/80 text-xs uppercase tracking-[0.2em]">
              Overview
            </p>
            <h1 className="text-3xl font-semibold">Your envelopes</h1>
            <p className="text-indigo-100/80 text-sm max-w-xl">
              Track, send, and complete signatures with clarity. Stats update as you filter.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:translate-y-[-1px] transition"
          >
            New Envelope
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        {envelopes && envelopes.length > 0 ? (
          <EnvelopesBoard envelopes={envelopes as Envelope[]} />
        ) : (
          <div className="text-indigo-100">No envelopes yet. Create one.</div>
        )}
      </section>
    </div>
  );
}

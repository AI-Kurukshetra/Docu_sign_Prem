'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

export type Envelope = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const statusOptions = ["all", "draft", "sent", "signed", "completed", "declined", "pending"];
const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A-Z" },
];

export function EnvelopesBoard({ envelopes }: { envelopes: Envelope[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = envelopes || [];
    if (status !== "all") list = list.filter((e) => e.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "oldest") {
      sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    list = sorted;
    return list;
  }, [envelopes, query, sort, status]);

  const counts = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter(
      (e) => e.status === "completed" || e.status === "signed"
    ).length;
    const pending = filtered.filter(
      (e) => e.status !== "completed" && e.status !== "signed"
    ).length;
    return { total, completed, pending };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total (filtered)"
          value={counts.total}
          accent="from-indigo-400 to-indigo-600"
          selected={status === "all"}
          onClick={() => setStatus("all")}
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          accent="from-emerald-400 to-emerald-600"
          selected={status === "completed" || status === "signed"}
          onClick={() => setStatus("completed")}
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          accent="from-amber-400 to-amber-600"
          selected={status === "pending" || status === "sent" || status === "draft" || status === "declined"}
          onClick={() => setStatus("pending")}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-lg shadow-slate-900/25">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search envelopes..."
              className="w-full h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-indigo-100/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <Select
              value={status}
              onChange={setStatus}
              options={statusOptions.map((s) => ({
                value: s,
                label: s === "all" ? "All statuses" : s,
              }))}
              ariaLabel="Filter by status"
            />
          </div>
          <div>
            <Select
              value={sort}
              onChange={setSort}
              options={sortOptions}
              ariaLabel="Sort envelopes"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((env) => (
          <Link
            key={env.id}
            href={`/dashboard/envelope/${env.id}`}
            className="block bg-white rounded-2xl p-4 shadow-xl shadow-slate-900/15 border border-white/60 hover:-translate-y-0.5 hover:shadow-2xl transition text-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{env.title}</div>
                <div className="text-sm text-slate-500">
                  {new Date(env.created_at).toLocaleString()}
                </div>
              </div>
              <span className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                {env.status}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-indigo-100">No envelopes match that filter.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  accent: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border ${
        selected ? "border-white/40 ring-2 ring-indigo-400/40" : "border-white/15"
      } bg-white/5 backdrop-blur p-4 shadow-lg shadow-slate-900/20 text-left transition hover:border-white/30`}
    >
      <div className="text-sm text-indigo-100/80">{label}</div>
      <div
        className={`mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${accent} px-3 py-2 text-lg font-semibold text-white shadow-lg`}
      >
        {value}
      </div>
    </button>
  );
}

type SelectOption = { value: string; label: string };

function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="w-full h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span>
          {options.find((o) => o.value === value)?.label || value}
        </span>
        <svg
          className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur shadow-xl shadow-slate-900/40">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 ${
                o.value === value ? "bg-white/10" : ""
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useRef, useState } from "react";

type Recipient = {
  id: string;
  email: string;
  status: string;
  access_token: string;
};

type Toast = { id: number; message: string; tone: "success" | "error" };

export function RecipientsList({
  recipients,
  siteUrl,
}: {
  recipients: Recipient[];
  siteUrl: string;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  const pushToast = (message: string, tone: "success" | "error" = "success") => {
    toastCounter.current += 1;
    const id = toastCounter.current;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };

  const resend = async (id: string) => {
    const res = await fetch("/api/recipients/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: id }),
    });
    if (!res.ok) pushToast("Failed to resend", "error");
    else pushToast("Link resent");
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/recipients/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: id, status }),
    });
    if (!res.ok) pushToast("Failed to update", "error");
    else pushToast("Status updated");
  };

  const copyLink = async (token: string) => {
    const link = `${siteUrl}/sign/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      pushToast("Sign link copied");
    } catch {
      // Fallback when clipboard API unavailable
      window.prompt("Copy sign link:", link);
    }
  };

  if (!recipients?.length) {
    return <div className="text-slate-500 text-sm">No recipients.</div>;
  }

  return (
    <div className="space-y-3 relative">
      <ToastList toasts={toasts} />
      {recipients.map((r) => (
        <div
          key={r.id}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-100 rounded-xl p-4 bg-slate-50"
        >
          <div className="space-y-1">
            <div className="font-semibold text-slate-900">{r.email}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Status: {r.status}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${siteUrl}/sign/${r.access_token}`}
              target="_blank"
              className="px-3 py-2 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
              rel="noreferrer"
            >
              Open
            </a>
            <button
              onClick={() => copyLink(r.access_token)}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Copy link
            </button>
            <button
              onClick={() => resend(r.id)}
              className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Resend
            </button>
            <select
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
              value={r.status}
              onChange={(e) => updateStatus(r.id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="sent">sent</option>
              <option value="viewed">viewed</option>
              <option value="signed">signed</option>
              <option value="completed">completed</option>
              <option value="declined">declined</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm text-white backdrop-blur border border-white/10 transition ${
            t.tone === "error"
              ? "bg-red-600/90 shadow-red-500/30"
              : "bg-emerald-600/90 shadow-emerald-500/30"
          }`}
          style={{ minWidth: "220px" }}
        >
          <span className="text-lg">
            {t.tone === "error" ? "⚠️" : "✔️"}
          </span>
          <div className="leading-snug text-white/95">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

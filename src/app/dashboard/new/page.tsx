'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { v4 as uuidv4 } from "uuid";

export default function NewEnvelopePage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recipients, setRecipients] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!file) {
      alert("Upload a PDF first.");
      return;
    }

    setLoading(true);
    const path = `documents/${uuidv4()}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadErr) {
      setLoading(false);
      alert(uploadErr.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Ensure a profile row exists for FK owner_id
    if (session?.user.id) {
      await supabase.from("profiles").upsert({ id: session.user.id });
    }

    const { data: envelope, error: envErr } = await supabase
      .from("envelopes")
      .insert({
        title,
        document_url: path,
        owner_id: session?.user.id,
        status: "sent",
      })
      .select()
      .single();

    if (envErr || !envelope) {
      setLoading(false);
      alert(envErr?.message || "Failed to create envelope");
      return;
    }

    const emails = recipients
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const rows = emails.map((email) => ({
      envelope_id: envelope.id,
      email,
      access_token: uuidv4(),
      status: "pending",
    }));

    if (rows.length) {
      const { error } = await supabase.from("recipients").insert(rows);
      if (error) console.error(error);
    }

    await supabase.from("events").insert({
      envelope_id: envelope.id,
      actor: "system",
      type: "created",
      message: "Envelope created",
    });

    // Auto-send sign links via API (Resend). Non-blocking: failure won't stop navigation.
    fetch("/api/send-sign-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ envelopeId: envelope.id }),
    }).catch((err) => console.error("send-links failed", err));

    setLoading(false);
    router.push(`/dashboard/envelope/${envelope.id}`);
  };

  return (
    <div className="text-white space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">New Envelope</h1>
        <p className="text-indigo-100/80 text-sm">
          Upload a PDF and list recipient emails (comma separated).
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 space-y-5 shadow-xl shadow-slate-900/20 border border-white/60 text-slate-900">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Contractor Agreement"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">PDF Document</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">
            Recipients (comma separated emails)
          </span>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-3 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition h-28"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="alice@example.com, bob@example.com"
          />
        </label>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 shadow-lg shadow-indigo-500/30"
        >
          {loading ? "Creating..." : "Create & Send"}
        </button>
      </div>
    </div>
  );
}

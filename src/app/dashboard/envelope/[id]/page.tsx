import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RecipientsList } from "./RecipientsList";

type Event = {
  id: number;
  type: string;
  message: string;
  created_at: string;
};

export default async function EnvelopeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: envelope } = await supabase
    .from("envelopes")
    .select("*")
    .eq("id", id)
    .single();

  const { data: recipients } = await supabase
    .from("recipients")
    .select("*")
    .eq("envelope_id", id);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("envelope_id", id)
    .order("created_at", { ascending: false });

  const admin = supabaseAdmin();

  const { data: docUrl } = envelope
    ? await admin.storage
        .from("documents")
        .createSignedUrl(envelope.document_url, 60 * 60)
    : { data: null };

  const { data: finalUrl } =
    envelope && envelope.final_url
      ? await admin.storage
          .from("documents")
          .createSignedUrl(envelope.final_url, 60 * 60)
      : { data: null };

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{envelope?.title}</h1>
          <p className="text-indigo-100/80 text-sm capitalize">{envelope?.status}</p>
        </div>
        {docUrl?.signedUrl && (
          <a
            href={docUrl.signedUrl}
            target="_blank"
            className="px-3 py-1 rounded-lg border border-white/30 text-sm bg-white/10 hover:bg-white/20 transition"
          >
            Original PDF
          </a>
        )}
        {finalUrl?.signedUrl && (
          <a
            href={finalUrl.signedUrl}
            target="_blank"
            className="px-3 py-1 rounded-lg border border-emerald-300 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          >
            Final PDF
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-900/20 border border-white/60 text-slate-900">
          <div className="font-semibold mb-3">Recipients</div>
          <RecipientsList
            recipients={recipients || []}
            siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-900/20 border border-white/60 text-slate-900">
          <div className="font-semibold mb-3">Activity</div>
          <div className="space-y-2">
            {(events || []).map((ev: Event) => (
              <div
                key={ev.id}
                className="border border-slate-100 rounded-lg p-3 text-sm bg-slate-50"
              >
                <div className="font-medium capitalize">{ev.type}</div>
                <div className="text-slate-600">{ev.message}</div>
                <div className="text-slate-400">
                  {new Date(ev.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {(!events || events.length === 0) && (
              <div className="text-slate-500 text-sm">No events yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

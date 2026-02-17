import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import SignClient from "./sign-client";

export default async function SignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = supabaseAdmin();

  const { data: recipient } = await admin
    .from("recipients")
    .select("id,envelope_id,email,access_token,envelopes(document_url)")
    .eq("access_token", token)
    .single();

  if (!recipient) redirect("/");

  type Envs = { document_url: string } | { document_url: string }[];
  const envs = recipient.envelopes as Envs | null;
  const docPath = Array.isArray(envs) ? envs[0]?.document_url : envs?.document_url;
  if (!docPath) redirect("/");
  const { data: signed } = await admin.storage
    .from("documents")
    .createSignedUrl(docPath, 60 * 60);

  if (!signed?.signedUrl) redirect("/");

  return (
    <SignClient
      token={token}
      recipientId={recipient.id}
      envelopeId={recipient.envelope_id}
      pdfUrl={signed.signedUrl}
      recipientEmail={recipient.email}
    />
  );
}

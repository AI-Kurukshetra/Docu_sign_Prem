import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Buffer } from "buffer";
import { PDFDocument } from "pdf-lib";

type RecipientWithEnvelope = {
  id: string;
  envelope_id: string;
  access_token: string;
  status: string;
  envelopes: { document_url: string } | { document_url: string }[];
};

export async function POST(req: Request) {
  try {
    const { token, dataUrl } = await req.json();
    if (!token || !dataUrl) {
      return NextResponse.json({ error: "Missing token or signature" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: recipient, error } = await admin
      .from("recipients")
      .select("id,envelope_id,access_token,status,envelopes(document_url)")
      .eq("access_token", token)
      .single();

    if (error || !recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Download original PDF
    const envelopes = (recipient as RecipientWithEnvelope).envelopes;
    const originalPath = Array.isArray(envelopes)
      ? envelopes[0]?.document_url
      : envelopes.document_url;
    const { data: download, error: dlErr } = await admin.storage
      .from("documents")
      .download(originalPath);
    if (dlErr || !download) {
      return NextResponse.json({ error: "Unable to fetch document" }, { status: 500 });
    }

    const pdfBytes = await download.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Convert signature data URL to bytes
    const base64 = dataUrl.split(",")[1];
    const sigBytes = Uint8Array.from(Buffer.from(base64, "base64"));
    const pngImage = await pdfDoc.embedPng(sigBytes);

    const page = pdfDoc.getPages().at(-1)!;
    const { width } = page.getSize();
    const sigWidth = 200;
    const sigHeight = (pngImage.height / pngImage.width) * sigWidth;

    page.drawImage(pngImage, {
      x: width - sigWidth - 40,
      y: 60,
      width: sigWidth,
      height: sigHeight,
    });

    const stampedBytes = await pdfDoc.save();
    const finalPath = `documents/final/${recipient.envelope_id}.pdf`;

    const stampedBuffer = Buffer.from(stampedBytes);
    const { error: uploadErr } = await admin.storage
      .from("documents")
      .upload(finalPath, stampedBuffer, {
        upsert: true,
        contentType: "application/pdf",
      });
    if (uploadErr) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    await admin
      .from("recipients")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", recipient.id);

    await admin
      .from("envelopes")
      .update({ status: "completed", final_url: finalPath })
      .eq("id", recipient.envelope_id);

    await admin.from("events").insert({
      envelope_id: recipient.envelope_id,
      actor: "recipient",
      type: "signed",
      message: "Recipient signed the document",
    });

    // generate a short-lived signed URL for immediate download
    const { data: signedFinal } = await admin.storage
      .from("documents")
      .createSignedUrl(finalPath, 60 * 10);

    return NextResponse.json({ ok: true, finalUrl: signedFinal?.signedUrl || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    return NextResponse.json(
      { ok: false, message: "SMTP_HOST, SMTP_PORT, SMTP_FROM required." },
      { status: 200 }
    );
  }

  try {
    const { envelopeId } = await req.json();
    if (!envelopeId) {
      return NextResponse.json({ error: "envelopeId required" }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { data: envelope } = await admin
      .from("envelopes")
      .select("id,title")
      .eq("id", envelopeId)
      .single();
    const { data: recipients } = await admin
      .from("recipients")
      .select("email,access_token")
      .eq("envelope_id", envelopeId);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth:
        SMTP_USER && SMTP_PASS
          ? {
              user: SMTP_USER,
              pass: SMTP_PASS,
            }
          : undefined,
    });

    const sendResults = await Promise.all(
      (recipients || []).map(async (r) => {
        try {
          const link = `${siteUrl}/sign/${r.access_token}`;
          const info = await transporter.sendMail({
            from: SMTP_FROM,
            to: r.email,
            subject: `Please sign: ${envelope?.title || "Document"}`,
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 660px; margin: 0 auto; padding: 24px; background: linear-gradient(135deg,#0f172a,#0b1224); color: #e5e7eb; border-radius: 18px;">
                <div style="padding: 20px; border: 1px solid #1f2937; border-radius: 14px; background: #0b1224;">
                  <div style="font-weight: 700; font-size: 20px; margin-bottom: 6px;">Please sign this document</div>
                  <div style="opacity: 0.85; margin-bottom: 16px;">${envelope?.title || "Document"}</div>
                  <a href="${link}" style="display:inline-block;padding:14px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;box-shadow:0 12px 30px rgba(99,102,241,0.35);">Open & Sign</a>
                </div>
                <div style="margin-top:16px;font-size:12px;opacity:0.75;line-height:1.6;">
                  If the button does not work, copy and paste this URL into your browser:<br/>
                  <span style="word-break:break-all;color:#c7d2fe;">${link}</span>
                </div>
              </div>
            `,
          });
          return { email: r.email, ok: true, messageId: info.messageId };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "send error";
          return { email: r.email, ok: false, error: message };
        }
      })
    );

    const failures = sendResults.filter((r) => !r.ok);
    if (failures.length) {
      console.error("SMTP send failures:", failures);
    }

    return NextResponse.json({ ok: failures.length === 0, results: sendResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}

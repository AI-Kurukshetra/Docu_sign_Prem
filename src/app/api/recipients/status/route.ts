import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { recipientId, status } = await req.json();
    if (!recipientId || !status) {
      return NextResponse.json({ error: "recipientId and status required" }, { status: 400 });
    }
    const admin = supabaseAdmin();
    const { error } = await admin
      .from("recipients")
      .update({ status })
      .eq("id", recipientId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

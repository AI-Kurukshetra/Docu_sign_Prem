import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold">
              DS
            </div>
            <div>
              <div className="font-semibold text-white">DocuSign Clone</div>
              <div className="text-xs text-indigo-100/80">
                {session.user.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/dashboard"
              className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/new"
              className="px-3 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/30"
            >
              New Envelope
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}

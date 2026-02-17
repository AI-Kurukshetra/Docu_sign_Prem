'use client';

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const supabase = supabaseBrowser();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/login");
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm border border-white/20"
    >
      {pending ? "Logging out..." : "Logout"}
    </button>
  );
}

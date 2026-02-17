import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No cookie mutations in RSC; if needed, move logic to a route handler/server action.
        setAll() {},
      },
    }
  );
};

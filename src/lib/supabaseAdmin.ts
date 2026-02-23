import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set");
}

export const supabaseAdmin = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: "public"
  }
});


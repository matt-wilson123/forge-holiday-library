import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const checks = {
    envVars: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || "missing"
    },
    database: {
      connected: false,
      error: null as string | null,
      tableExists: false
    }
  };

  // Test database connection
  try {
    const { data, error } = await supabaseAdmin
      .from("books")
      .select("id")
      .limit(1);

    if (error) {
      checks.database.error = error.message;
    } else {
      checks.database.connected = true;
      checks.database.tableExists = true;
    }
  } catch (err: any) {
    checks.database.error = err?.message || "Connection failed";
  }

  return NextResponse.json(checks, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

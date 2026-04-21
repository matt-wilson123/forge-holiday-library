import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET() {
  try {
    // Lightweight query to keep database activity alive.
    const { error } = await supabaseAdmin.from("books").select("id").limit(1);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Keepalive error:", error);
      return NextResponse.json(
        { ok: false, error: "Keepalive query failed." },
        { status: 500, headers: CACHE_CONTROL_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, source: "vercel-cron" },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Keepalive route error:", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected keepalive error." },
      { status: 500, headers: CACHE_CONTROL_HEADERS }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("colleagues")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch colleagues." },
        { status: 500, headers: CACHE_CONTROL_HEADERS }
      );
    }

    return NextResponse.json(
      {
        colleagues: (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          avatarUrl: c.avatar_url
        }))
      },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get colleagues API error", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching colleagues." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email }: { name?: string; email?: string } = body ?? {};

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("colleagues")
      .insert({
        name,
        email
      })
      .select("*")
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Supabase error creating colleague:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create colleague." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create colleague - no data returned." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        colleague: {
          id: data.id,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatar_url
        }
      },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Create colleague API error", error);
    return NextResponse.json(
      { error: error?.message || "Unexpected error while creating colleague." },
      { status: 500 }
    );
  }
}

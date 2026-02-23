import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing colleague id." }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      email
    }: {
      name?: string;
      email?: string;
    } = body ?? {};

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("colleagues")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update colleague." },
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Update colleague API error", error);
    return NextResponse.json(
      { error: "Unexpected error while updating colleague." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing colleague id." }, { status: 400 });
    }

    // Check if colleague has active loans
    const { data: activeLoans } = await supabaseAdmin
      .from("loans")
      .select("id")
      .eq("colleague_id", id)
      .is("returned_at", null)
      .limit(1);

    if (activeLoans && activeLoans.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete colleague with active book loans. Please return all books first."
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("colleagues").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete colleague." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Delete colleague API error", error);
    return NextResponse.json(
      { error: "Unexpected error while deleting colleague." },
      { status: 500 }
    );
  }
}

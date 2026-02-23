import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing book id." }, { status: 400 });
    }

    // Load book so we can give a nicer error
    const { data: book, error: bookError } = await supabaseAdmin
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    // Prevent deleting borrowed books (user can change this later)
    if (book.status === "borrowed") {
      return NextResponse.json(
        { error: "This book is currently borrowed and can't be removed yet." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("books").delete().eq("id", id);
    if (error) {
      return NextResponse.json(
        { error: "Failed to delete book." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Delete book API error", error);
    return NextResponse.json(
      { error: "Unexpected error while deleting book." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing book id." }, { status: 400 });
    }

    const body = await req.json();
    const {
      synopsis,
      yearPublished,
      pageCount,
      domains,
      ownerId
    }: {
      synopsis?: string | null;
      yearPublished?: number | null;
      pageCount?: number | null;
      domains?: string[];
      ownerId?: string | null;
    } = body ?? {};

    const updateData: Record<string, any> = {};
    if (synopsis !== undefined) {
      updateData.synopsis = synopsis;
    }
    if (yearPublished !== undefined) {
      updateData.year_published = yearPublished != null ? Number(yearPublished) : null;
    }
    if (pageCount !== undefined) {
      updateData.page_count = pageCount != null ? Number(pageCount) : null;
    }
    if (domains !== undefined) {
      updateData.domain = Array.isArray(domains) ? domains : [];
    }
    if (ownerId !== undefined) {
      updateData.owner_id = ownerId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("books")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update book." },
        { status: 500 }
      );
    }

    // Fetch active loan if any
    const { data: loanData } = await supabaseAdmin
      .from("loans")
      .select("*, colleague_id")
      .eq("book_id", id)
      .is("returned_at", null)
      .maybeSingle();

    let borrowerName: string | null = null;
    let borrowedAt: string | null = null;

    if (loanData) {
      borrowedAt = loanData.borrowed_at;
      const { data: colleague } = await supabaseAdmin
        .from("colleagues")
        .select("name")
        .eq("id", loanData.colleague_id)
        .single();
      borrowerName = colleague?.name ?? null;
    }

    // Fetch owner name if owner_id is set
    let ownerName: string | null = null;
    if (data.owner_id) {
      const { data: owner } = await supabaseAdmin
        .from("colleagues")
        .select("name")
        .eq("id", data.owner_id)
        .single();
      ownerName = owner?.name ?? null;
    }

    return NextResponse.json(
      {
        book: {
          id: data.id,
          isbn: data.isbn,
          title: data.title,
          author: data.author,
          coverUrl: data.cover_url,
          synopsis: data.synopsis,
          yearPublished: data.year_published ?? null,
          pageCount: data.page_count ?? null,
          domains: data.domain ?? [],
          status: data.status,
          ownerName,
          borrowerName,
          borrowedAt
        }
      },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Update book API error", error);
    return NextResponse.json(
      { error: "Unexpected error while updating book." },
      { status: 500 }
    );
  }
}

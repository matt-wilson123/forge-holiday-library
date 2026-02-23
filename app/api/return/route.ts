import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function POST(req: Request) {
  try {
    const { bookId, colleagueId } = await req.json();

    if (!bookId || !colleagueId) {
      return NextResponse.json(
        { error: "Missing bookId or colleagueId" },
        { status: 400 }
      );
    }

    // Look up colleague by ID
    const { data: colleague, error: colleagueError } = await supabaseAdmin
      .from("colleagues")
      .select("*")
      .eq("id", colleagueId)
      .single();

    if (colleagueError || !colleague) {
      return NextResponse.json(
        {
          error: "Colleague not found."
        },
        { status: 404 }
      );
    }

    // Find active loan for this colleague and book
    const {
      data: loan,
      error: loanError
    } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("book_id", bookId)
      .eq("colleague_id", colleague.id)
      .is("returned_at", null)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        {
          error:
            "You don't have this book checked out, so it can't be returned."
        },
        { status: 400 }
      );
    }

    // Mark loan as returned
    const { error: updateLoanError } = await supabaseAdmin
      .from("loans")
      .update({ returned_at: new Date().toISOString() })
      .eq("id", loan.id);

    if (updateLoanError) {
      return NextResponse.json(
        { error: "Unable to mark this loan as returned. Please try again." },
        { status: 500 }
      );
    }

    // Update book status
    const { data: book, error: bookError } = await supabaseAdmin
      .from("books")
      .update({ status: "available" })
      .eq("id", bookId)
      .select("*")
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        {
          error:
            "Book return recorded, but failed to update book status. Please refresh."
        },
        { status: 500 }
      );
    }

    const responseBook = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url,
      synopsis: book.synopsis,
      yearPublished: book.year_published ?? null,
      pageCount: book.page_count ?? null,
      domains: book.domain ?? [],
      status: "available" as const,
      borrowerName: null,
      borrowedAt: null
    };

    return NextResponse.json(
      { book: responseBook },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Return API error", error);
    return NextResponse.json(
      { error: "Unexpected error while returning book." },
      { status: 500 }
    );
  }
}


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

    // Load book
    const { data: book, error: bookError } = await supabaseAdmin
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    if (book.status === "borrowed") {
      return NextResponse.json(
        {
          error:
            "This book is already marked as borrowed. Please refresh or choose another book."
        },
        { status: 400 }
      );
    }

    // Check for any active loan on this book
    const { data: activeLoans, error: loansError } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("book_id", bookId)
      .is("returned_at", null);

    if (loansError) {
      return NextResponse.json(
        { error: "Unable to check existing loans." },
        { status: 500 }
      );
    }

    if (activeLoans && activeLoans.length > 0) {
      const alreadyBySameColleague = activeLoans.some(
        (l) => l.colleague_id === colleague.id
      );
      if (alreadyBySameColleague) {
        return NextResponse.json(
          {
            error:
              "You already have this book checked out. Please return it before borrowing again."
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "This book is already borrowed by someone else. Please choose another."
        },
        { status: 400 }
      );
    }

    // Create loan
    const {
      data: loan,
      error: loanError
    } = await supabaseAdmin
      .from("loans")
      .insert({
        book_id: bookId,
        colleague_id: colleague.id
      })
      .select()
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { error: "Unable to create loan. Please try again." },
        { status: 500 }
      );
    }

    // Update book status
    const { error: updateError } = await supabaseAdmin
      .from("books")
      .update({ status: "borrowed" })
      .eq("id", bookId);

    if (updateError) {
      return NextResponse.json(
        { error: "Loan created but failed to update book status." },
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
      status: "borrowed" as const,
      borrowerName: colleague.name,
      borrowedAt: loan.borrowed_at
    };

    return NextResponse.json(
      { book: responseBook },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Borrow API error", error);
    return NextResponse.json(
      { error: "Unexpected error while borrowing book." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Book, Colleague } from "@/types";

const CACHE_CONTROL_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET() {
  try {
    const [{ data: booksData, error: booksError }, { data: colleaguesData, error: colleaguesError }, { data: loansData, error: loansError }] =
      await Promise.all([
        supabaseAdmin
          .from("books")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("colleagues").select("*"),
        supabaseAdmin
          .from("loans")
          .select("*")
          .is("returned_at", null)
      ]);

    if (booksError) {
      // eslint-disable-next-line no-console
      console.error("Error loading books", booksError);
      return NextResponse.json(
        { error: "Failed to fetch books." },
        { status: 500, headers: CACHE_CONTROL_HEADERS }
      );
    }

    const colleagues: Colleague[] =
      (colleaguesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        avatarUrl: c.avatar_url
      })) ?? [];

    const colleagueById = new Map(colleagues.map((c) => [c.id, c]));

    const loansByBookId = new Map<string, any>();
    (loansData || []).forEach((loan: any) => {
      loansByBookId.set(loan.book_id, loan);
    });

    const books: Book[] =
      (booksData || []).map((b: any) => {
        const activeLoan = loansByBookId.get(b.id);
        const borrower = activeLoan
          ? colleagueById.get(activeLoan.colleague_id)
          : undefined;
        const owner = b.owner_id ? colleagueById.get(b.owner_id) : undefined;
        return {
          id: b.id,
          isbn: b.isbn,
          title: b.title,
          author: b.author,
          coverUrl: b.cover_url,
          synopsis: b.synopsis,
          yearPublished: b.year_published ?? null,
          pageCount: b.page_count ?? null,
          domains: b.domain || [],
          status: b.status,
          ownerName: owner?.name ?? null,
          borrowerName: borrower?.name ?? null,
          borrowedAt: activeLoan?.borrowed_at ?? null
        };
      }) ?? [];

    return NextResponse.json(
      { books, colleagues },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Get books API error", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching books." },
      { status: 500, headers: CACHE_CONTROL_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // eslint-disable-next-line no-console
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase URL" },
        { status: 500 }
      );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // eslint-disable-next-line no-console
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase service role key" },
        { status: 500 }
      );
    }

    const body = await req.json();
    // eslint-disable-next-line no-console
    console.log("Received book data:", JSON.stringify(body, null, 2));
    
    const {
      title,
      author,
      coverUrl,
      synopsis,
      yearPublished,
      pageCount,
      domains,
      ownerId
    }: {
      title?: string;
      author?: string;
      coverUrl?: string | null;
      synopsis?: string | null;
      yearPublished?: number | null;
      pageCount?: number | null;
      domains?: string[];
      ownerId?: string | null;
    } = body ?? {};

    if (!title || !author) {
      return NextResponse.json(
        { error: "Missing required fields: title, author" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line no-console
    console.log("Preparing to insert:", {
      title,
      author,
      cover_url: coverUrl,
      synopsis,
      domain: domains,
      owner_id: ownerId,
      status: "available"
    });

    // Test connection and verify service role is working
    const { data: testData, error: testError } = await supabaseAdmin
      .from("books")
      .select("id")
      .limit(1);

    if (testError) {
      // eslint-disable-next-line no-console
      console.error("Supabase connection test error:", JSON.stringify(testError, null, 2));
      return NextResponse.json(
        { 
          error: `Database connection error: ${testError.message || "Cannot connect to database"}`,
          details: testError.details || null,
          hint: testError.hint || "Check your Supabase credentials and database connection",
          code: testError.code || null
        },
        { status: 500 }
      );
    }

    // eslint-disable-next-line no-console
    console.log("Connection test successful, testData:", testData);

    // Verify owner_id exists if provided
    if (ownerId) {
      const { data: ownerCheck, error: ownerError } = await supabaseAdmin
        .from("colleagues")
        .select("id")
        .eq("id", ownerId)
        .single();

      if (ownerError || !ownerCheck) {
        // eslint-disable-next-line no-console
        console.error("Owner ID not found:", ownerId, ownerError);
        return NextResponse.json(
          { 
            error: `Invalid owner ID: The colleague with ID ${ownerId} does not exist.`,
            details: ownerError?.message || null
          },
          { status: 400 }
        );
      }
    }

    const insertData = {
      title,
      author,
      cover_url: coverUrl ?? null,
      synopsis: synopsis ?? null,
      year_published: yearPublished != null ? Number(yearPublished) : null,
      page_count: pageCount != null ? Number(pageCount) : null,
      domain: Array.isArray(domains) ? domains : [],
      owner_id: ownerId ?? null,
      status: "available" as const
    };

    // eslint-disable-next-line no-console
    console.log("Inserting into database:", JSON.stringify(insertData, null, 2));

    const { data, error } = await supabaseAdmin
      .from("books")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error("=== SUPABASE ERROR ===");
      // eslint-disable-next-line no-console
      console.error("Full error object:", JSON.stringify(error, null, 2));
      // eslint-disable-next-line no-console
      console.error("Error code:", error.code);
      // eslint-disable-next-line no-console
      console.error("Error message:", error.message);
      // eslint-disable-next-line no-console
      console.error("Error details:", error.details);
      // eslint-disable-next-line no-console
      console.error("Error hint:", error.hint);
      // eslint-disable-next-line no-console
      console.error("Error type:", typeof error);
      // eslint-disable-next-line no-console
      console.error("Error keys:", Object.keys(error));
      
      // Return detailed error - try multiple ways to get the message
      const errorMsg = error.message || 
                      error.details || 
                      error.hint || 
                      JSON.stringify(error) ||
                      "Failed to create book.";
      
      return NextResponse.json(
        { 
          error: errorMsg,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
          fullError: JSON.stringify(error),
          attemptedInsert: insertData
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create book - no data returned." },
        { status: 500 }
      );
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
          borrowerName: null,
          borrowedAt: null
        }
      },
      { headers: CACHE_CONTROL_HEADERS }
    );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Create book API error", error);
    const errorMessage = error?.message || error?.toString() || "Unexpected error while creating book.";
    return NextResponse.json(
      { 
        error: errorMessage,
        type: error?.name || "UnknownError",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}


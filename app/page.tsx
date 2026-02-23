import BooksApp from "@/components/BooksApp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Book, Colleague } from "@/types";

// Prevent Next.js from caching this page
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getData(): Promise<{
  books: Book[];
  colleagues: Colleague[];
}> {
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
    // Return empty array instead of crashing
  }
  
  // Log how many books were loaded for debugging
  // eslint-disable-next-line no-console
  console.log(`Loaded ${booksData?.length || 0} books from database`);
  if (colleaguesError) {
    // eslint-disable-next-line no-console
    console.error("Error loading colleagues", colleaguesError);
  }
  if (loansError) {
    // eslint-disable-next-line no-console
    console.error("Error loading loans", loansError);
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

  return { books, colleagues };
}

export default async function Page() {
  const { books, colleagues } = await getData();

  return <BooksApp initialBooks={books} colleagues={colleagues} />;
}


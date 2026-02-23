"use client";

import { useEffect, useState } from "react";
import type { Book, BookDomain, Colleague } from "@/types";

const DOMAINS: BookDomain[] = [
  "Product",
  "Engineering",
  "Data",
  "Product Design",
  "Marketing",
  "People",
  "Leadership",
  "Strategy",
  "AI"
];

const DOMAIN_COLORS: Record<BookDomain, string> = {
  Product: "bg-blue-100 text-blue-700",
  Engineering: "bg-emerald-100 text-emerald-700",
  Data: "bg-purple-100 text-purple-700",
  "Product Design": "bg-pink-100 text-pink-700",
  Marketing: "bg-orange-100 text-orange-700",
  People: "bg-yellow-100 text-yellow-700",
  Leadership: "bg-red-100 text-red-700",
  Strategy: "bg-teal-100 text-teal-700",
  AI: "bg-indigo-100 text-indigo-700",
  Other: "bg-gray-100 text-gray-600"
};

function daysAgo(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm font-medium animate-bounce">
      <span className="text-green-400 text-lg">✓</span> {message}
    </div>
  );
}

function BookCard({
  book,
  onBorrow,
  onOpenDetails,
  isAdmin,
  onRemove,
  onEdit
}: {
  book: Book;
  onBorrow: (book: Book) => void;
  onOpenDetails: (book: Book) => void;
  isAdmin: boolean;
  onRemove: (book: Book) => void;
  onEdit?: (book: Book) => void;
}) {
  const borrowed = book.status === "borrowed";
  const overdue =
    borrowed && book.borrowedAt
      ? (Date.now() - new Date(book.borrowedAt).getTime()) / 86400000 > 30
      : false;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div
        className="relative cursor-pointer"
        onClick={() => onOpenDetails(book)}
      >
        <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-sm p-4 text-center">${book.title}</div>`;
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-sm p-4 text-center">
              {book.title}
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          {borrowed ? (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                overdue ? "bg-red-500 text-white" : "bg-amber-100 text-amber-700"
              }`}
            >
              {overdue ? "Overdue" : "Borrowed"}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              Available
            </span>
          )}
        </div>
      </div>

      <div
        className="p-4 flex flex-col flex-1 cursor-pointer"
        onClick={() => onOpenDetails(book)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
            {book.ownerName && (
              <p className="text-xs text-gray-400 mt-1">
                Gifted by {book.ownerName}
              </p>
            )}
          </div>
          {isAdmin && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(book);
              }}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit book"
            >
              ✎
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {book.domains.map((d) => (
            <span
              key={d}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${DOMAIN_COLORS[d]}`}
            >
              {d}
            </span>
          ))}
        </div>

        {borrowed && book.borrowerName && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{book.borrowerName}</span>{" "}
            · {daysAgo(book.borrowedAt ?? undefined)}
          </div>
        )}

        <div className="mt-auto pt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!borrowed && (
            <button
              onClick={() => onBorrow(book)}
              className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Borrow
            </button>
          )}
          {borrowed && (
            <div className="flex-1 bg-gray-100 text-gray-400 text-sm font-medium py-2.5 rounded-xl text-center cursor-not-allowed">
              Borrowed
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => onRemove(book)}
              className="px-3 py-2.5 text-gray-400 hover:text-red-500 transition-colors text-sm"
              title="Remove book"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface BookDetailsModalProps {
  book: Book;
  onBorrow: (book: Book) => void;
  onClose: () => void;
}

function BookDetailsModal({ book, onBorrow, onClose }: BookDetailsModalProps) {
  const borrowed = book.status === "borrowed";
  const overdue =
    borrowed && book.borrowedAt
      ? (Date.now() - new Date(book.borrowedAt).getTime()) / 86400000 > 30
      : false;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:max-h-[90vh] sm:rounded-2xl rounded-t-3xl flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Book details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">
                  {book.title}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
              {book.ownerName && (
                <p className="text-xs text-gray-400 mt-1">
                  Gifted by {book.ownerName}
                </p>
              )}
              <div className="mt-2">
                {borrowed ? (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      overdue ? "bg-red-500 text-white" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {overdue ? "Overdue" : "Borrowed"}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    Available
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {book.domains.map((d) => (
              <span
                key={d}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${DOMAIN_COLORS[d]}`}
              >
                {d}
              </span>
            ))}
          </div>
          {book.synopsis && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Synopsis
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{book.synopsis}</p>
            </div>
          )}
          {(book.yearPublished != null || book.pageCount != null) && (
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {book.yearPublished != null && (
                <span>Published {book.yearPublished}</span>
              )}
              {book.pageCount != null && (
                <span>{book.pageCount} pages</span>
              )}
            </div>
          )}
          {borrowed && book.borrowerName && (
            <p className="text-sm text-gray-500">
              Borrowed by <span className="font-medium text-gray-700">{book.borrowerName}</span>
              {book.borrowedAt && ` · ${daysAgo(book.borrowedAt)}`}
            </p>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          {!borrowed ? (
            <button
              type="button"
              onClick={() => onBorrow(book)}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800"
            >
              Borrow
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 text-center text-sm font-medium">
              Borrowed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScanBadgeModalProps {
  action: "borrow" | "return";
  book: Book | null;
  colleagues: Colleague[];
  books?: Book[]; // For return flow to show borrowed books
  onConfirm: (colleague: Colleague, selectedBook?: Book) => void;
  onCancel: () => void;
  onColleagueCreated?: (colleague: Colleague) => void;
}

function emailFromFirstLast(firstName: string, lastName: string): string {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, "") || "user";
  const last = lastName.toLowerCase().replace(/[^a-z]/g, "") || "name";
  return `${first}.${last}@forgeholidays.com`;
}

function ScanBadgeModal({
  action,
  book,
  colleagues,
  books = [],
  onConfirm,
  onCancel,
  onColleagueCreated
}: ScanBadgeModalProps) {
  const [step, setStep] = useState<"name" | "confirm" | "select-book">("name");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(
    null
  );
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSubmitName = async () => {
    const first = firstName.trim();
    const last = lastName.trim();
    setNameError(null);
    if (!first || !last) {
      setNameError("Please enter both first name and last name.");
      return;
    }
    const name = `${first} ${last}`;
    const email = emailFromFirstLast(first, last);

    setIsSubmitting(true);
    try {
      // Find existing colleague by name or email
      let colleague: Colleague | undefined = colleagues.find(
        (c) =>
          c.email.toLowerCase() === email ||
          c.name.toLowerCase() === name.toLowerCase()
      );

      if (action === "borrow") {
        if (!colleague) {
          const res = await fetch("/api/colleagues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
            cache: "no-store"
          });
          const payload = await res.json();
          if (!res.ok) {
            setNameError(payload?.error || "Failed to create profile. Please try again.");
            setIsSubmitting(false);
            return;
          }
          colleague = payload.colleague as Colleague;
          if (onColleagueCreated) onColleagueCreated(colleague);
        }
        if (colleague) {
          setSelectedColleague(colleague);
          setStep("confirm");
        }
      } else {
        // Return: must exist, and can only return books they borrowed
        if (!colleague) {
          setNameError("No account found with that name. Please check spelling or borrow a book first.");
          setIsSubmitting(false);
          return;
        }
        const borrowedByThem = books.filter(
          (b) => b.status === "borrowed" && b.borrowerName === colleague!.name
        );
        if (borrowedByThem.length === 0) {
          setNameError(`${colleague.name} doesn't have any books to return.`);
          setIsSubmitting(false);
          return;
        }
        setSelectedColleague(colleague);
        if (borrowedByThem.length === 1) {
          setSelectedBook(borrowedByThem[0]);
          setStep("confirm");
        } else {
          setStep("select-book");
        }
      }
    } catch {
      setNameError("Network error. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {step === "name" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                {action === "borrow" ? "📖" : "↩️"}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {action === "borrow" && book
                  ? `Borrow "${book.title}"`
                  : "Return a Book"}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {action === "borrow"
                  ? "Enter your name to continue"
                  : "Enter your name so we can find your borrowed books"}
              </p>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label htmlFor="borrow-return-first" className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  id="borrow-return-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jane"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="borrow-return-last" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  id="borrow-return-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Smith"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {nameError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{nameError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitName}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-60"
            >
              {isSubmitting ? "Please wait…" : "Continue"}
            </button>
          </>
        )}

        {step === "select-book" && selectedColleague && action === "return" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                ↩️
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Select Book to Return
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {selectedColleague.name}&apos;s borrowed books
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {books
                .filter(
                  (b) =>
                    b.status === "borrowed" &&
                    b.borrowerName === selectedColleague.name
                )
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBook(b);
                      setStep("confirm");
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border-2 transition-colors ${
                      selectedBook?.id === b.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {b.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.coverUrl}
                        alt=""
                        className="w-12 h-16 object-contain rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {b.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.author} · Borrowed {daysAgo(b.borrowedAt ?? undefined)}
                      </p>
                    </div>
                  </button>
                ))}
            </div>

            <button
              onClick={() => setStep("name")}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
            >
              Back
            </button>
          </>
        )}

        {step === "confirm" && selectedColleague && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirm {action === "borrow" ? "Borrow" : "Return"}
              </h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-4">
                {(action === "borrow" ? book : selectedBook) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      (action === "borrow" ? book : selectedBook)?.coverUrl ??
                      ""
                    }
                    alt=""
                    className="w-16 h-20 object-contain rounded-lg"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedColleague.name}
                  </p>
                  {action === "borrow" && book ? (
                    <p className="text-sm text-gray-500 mt-1">
                      is borrowing{" "}
                      <span className="font-medium text-gray-700">
                        "{book.title}"
                      </span>
                    </p>
                  ) : selectedBook ? (
                    <p className="text-sm text-gray-500 mt-1">
                      is returning{" "}
                      <span className="font-medium text-gray-700">
                        "{selectedBook.title}"
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      is returning a book
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  action === "return" && books.filter(
                    (b) =>
                      b.status === "borrowed" &&
                      b.borrowerName === selectedColleague.name
                  ).length > 1
                    ? setStep("select-book")
                    : setStep("name")
                }
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (action === "return" && selectedBook) {
                    onConfirm(selectedColleague, selectedBook);
                  } else {
                    onConfirm(selectedColleague);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ReturnSelectModalProps {
  colleague: Colleague;
  books: Book[];
  onConfirm: (book: Book) => void;
  onCancel: () => void;
}

function ReturnSelectModal({
  colleague,
  books,
  onConfirm,
  onCancel
}: ReturnSelectModalProps) {
  const [selected, setSelected] = useState<Book | null>(null);
  const borrowedBooks = books.filter(
    (b) => b.status === "borrowed" && b.borrowerName === colleague.name
  );

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (borrowedBooks.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onCancel}
      >
        <div
          className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No books checked out
            </h2>
            <p className="text-gray-500 text-sm">
              {colleague.name} doesn&apos;t have any books to return.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Select book to return
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {colleague.name}&apos;s borrowed books
        </p>
        <div className="space-y-2 mb-4">
          {borrowedBooks.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border-2 transition-colors ${
                selected?.id === b.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              {b.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.coverUrl}
                  alt=""
                  className="w-12 h-16 object-contain rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{b.title}</p>
                <p className="text-xs text-gray-500">
                  Borrowed {daysAgo(b.borrowedAt ?? undefined)}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
              selected
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Return Book
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddBookModalProps {
  colleagues: Colleague[];
  onAdd: (book: {
    title: string;
    author: string;
    synopsis: string;
    coverUrl: string;
    domains: BookDomain[];
    ownerId: string | null;
  }) => void;
  onCancel: () => void;
}

type GoogleBookResult = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  description: string | null;
  isbn: string | null;
};

function AddBookModal({ colleagues, onAdd, onCancel }: AddBookModalProps) {
  const [form, setForm] = useState<{
    title: string;
    author: string;
    synopsis: string;
    coverUrl: string;
    domains: BookDomain[];
    ownerId: string | null;
  }>({
    title: "",
    author: "",
    synopsis: "",
    coverUrl: "",
    domains: [],
    ownerId: null
  });
  const [step, setStep] = useState<"search" | "edit">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const toggleDomain = (d: BookDomain) =>
    setForm((f) => ({
      ...f,
      domains: f.domains.includes(d)
        ? f.domains.filter((x) => x !== d)
        : [...f.domains, d]
    }));

  const performSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          trimmed
        )}&maxResults=10`
      );
      if (!res.ok) {
        throw new Error("Google Books returned an error");
      }
      const data = await res.json();
      const items: any[] = Array.isArray(data.items) ? data.items : [];

      const mapped: GoogleBookResult[] = items.map((item) => {
        const info = item.volumeInfo ?? {};
        const imageLinks = info.imageLinks ?? {};
        const identifiers: any[] = info.industryIdentifiers ?? [];
        const isbn13 =
          identifiers.find((id) => id.type === "ISBN_13")?.identifier ??
          identifiers.find((id) => id.type === "ISBN_10")?.identifier ??
          null;
        return {
          id: item.id,
          title: info.title ?? "Untitled",
          authors: Array.isArray(info.authors) ? info.authors : [],
          thumbnail:
            imageLinks.thumbnail ??
            imageLinks.smallThumbnail ??
            null,
          description: info.description ?? null,
          isbn: isbn13
        };
      });

      setResults(mapped);
      if (mapped.length === 0) {
        setSearchError("No books found. Try a different title or author.");
      }
    } catch {
      setSearchError(
        "Problem contacting Google Books. Check your connection and try again."
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (book: GoogleBookResult) => {
    setForm((f) => ({
      ...f,
      title: book.title ?? f.title,
      author: book.authors[0] ?? f.author,
      synopsis: book.description ?? f.synopsis,
      coverUrl: book.thumbnail ?? f.coverUrl
    }));
    setStep("edit");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add a Book</h2>

        {step === "search" && (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Search Google Books
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void performSearch(query);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="Type a title or author…"
                  />
                  <button
                    type="button"
                    onClick={() => void performSearch(query)}
                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Search
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  We&apos;ll use Google Books to auto-fill the details.
                </p>
              </div>
              {isSearching && (
                <p className="text-xs text-gray-500">Searching Google Books…</p>
              )}
              {searchError && (
                <p className="text-xs text-red-500">{searchError}</p>
              )}
            </div>

            {results.length > 0 && (
              <div className="mb-4 max-h-72 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-100">
                {results.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectResult(b)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    {b.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.thumbnail}
                        alt=""
                        className="w-10 h-14 object-cover rounded-md shadow-sm"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">
                        {b.title}
                      </p>
                      {b.authors.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {b.authors.join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wide">
                  or enter manually
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep("edit")}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
            >
              Manual Entry
            </button>
          </>
        )}

        {step === "edit" && (
          <>
            {form.coverUrl && (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverUrl}
                  alt=""
                  className="h-40 object-contain rounded-xl shadow-sm"
                />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Author
                </label>
                <input
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  TL;DR Synopsis
                </label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, synopsis: e.target.value }))
                  }
                  rows={3}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none"
                  placeholder="2-3 sentence summary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Cover Image URL
                </label>
                <input
                  value={form.coverUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coverUrl: e.target.value }))
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Domains
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomain(d)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        form.domains.includes(d)
                          ? `${DOMAIN_COLORS[d]} ring-2 ring-offset-1 ring-gray-300`
                          : "bg-gray-100 text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Gifted By (Owner)
                </label>
                <select
                  value={form.ownerId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ownerId: e.target.value || null
                    }))
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-white"
                >
                  <option value="">Office Library (no owner)</option>
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  form.title &&
                  onAdd({
                    title: form.title,
                    author: form.author,
                    synopsis: form.synopsis,
                    coverUrl: form.coverUrl,
                    domains: form.domains,
                    ownerId: form.ownerId
                  })
                }
                disabled={!form.title}
                className={`flex-1 py-3 rounded-xl font-medium text-sm ${
                  form.title
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Add Book
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface EditBookModalProps {
  book: Book;
  colleagues: Colleague[];
  onSave: (bookId: string, updates: { synopsis: string; domains: BookDomain[]; ownerId: string | null }) => void;
  onCancel: () => void;
}

function EditBookModal({ book, colleagues, onSave, onCancel }: EditBookModalProps) {
  const [synopsis, setSynopsis] = useState(book.synopsis ?? "");
  const [domains, setDomains] = useState<BookDomain[]>(book.domains);
  // Find current owner ID by matching ownerName
  const currentOwnerId = book.ownerName
    ? colleagues.find((c) => c.name === book.ownerName)?.id ?? null
    : null;
  const [ownerId, setOwnerId] = useState<string | null>(currentOwnerId);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const toggleDomain = (d: BookDomain) =>
    setDomains((ds) =>
      ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]
    );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Book</h2>
            <p className="text-sm text-gray-500 mt-1">{book.title}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {book.coverUrl && (
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverUrl}
              alt=""
              className="h-32 object-contain rounded-xl shadow-sm"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              TL;DR Synopsis
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={4}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none"
              placeholder="2-3 sentence summary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Domains
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    domains.includes(d)
                      ? `${DOMAIN_COLORS[d]} ring-2 ring-offset-1 ring-gray-300`
                      : "bg-gray-100 text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Gifted By (Owner)
            </label>
            <select
              value={ownerId ?? ""}
              onChange={(e) => setOwnerId(e.target.value || null)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              <option value="">Office Library (no owner)</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave(book.id, {
                synopsis,
                domains,
                ownerId
              })
            }
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface ManageColleaguesModalProps {
  colleagues: Colleague[];
  onUpdate: () => void;
  onCancel: () => void;
}

function ManageColleaguesModal({
  colleagues: initialColleagues,
  onUpdate,
  onCancel
}: ManageColleaguesModalProps) {
  const [colleagues, setColleagues] = useState<Colleague[]>(initialColleagues);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    email: string;
  }>({ name: "", email: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleEdit = (c: Colleague) => {
    setEditing(c.id);
    setForm({ name: c.name, email: c.email });
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const res = await fetch(`/api/colleagues/${encodeURIComponent(editing)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        alert(payload?.error ?? "Failed to update colleague.");
        return;
      }

      setColleagues((cs) =>
        cs.map((c) => (c.id === editing ? payload.colleague : c))
      );
      setEditing(null);
      setForm({ name: "", email: "" });
      onUpdate();
    } catch {
      alert("Network error while updating colleague.");
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      alert("Please fill in all fields.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/colleagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        alert(payload?.error ?? "Failed to add colleague.");
        return;
      }

      setColleagues((cs) => [...cs, payload.colleague]);
      setForm({ name: "", email: "" });
      setIsAdding(false);
      onUpdate();
    } catch {
      alert("Network error while adding colleague.");
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/colleagues/${encodeURIComponent(id)}`, {
        method: "DELETE",
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        alert(payload?.error ?? "Failed to delete colleague.");
        return;
      }

      setColleagues((cs) => cs.filter((c) => c.id !== id));
      onUpdate();
    } catch {
      alert("Network error while deleting colleague.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Colleagues</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add, edit, or remove colleagues
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Add New Colleague */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Add New Colleague</h3>
          <div className="space-y-2">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900"
            />
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900"
              />
              <button
                onClick={handleAdd}
                disabled={isAdding || !form.name || !form.email}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAdding || !form.name || !form.email
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Colleagues List */}
        <div className="space-y-2">
          {colleagues.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {editing === c.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setForm({ name: "", email: "" });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AdminLoginModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

function AdminLoginModal({ onLogin, onCancel }: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === "admin" && password === "!wel0vestaycations2026?") {
      localStorage.setItem("admin_authenticated", "true");
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🔐
          </div>
          <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Enter your credentials to access admin features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BooksAppProps {
  initialBooks: Book[];
  colleagues: Colleague[];
}

export default function BooksApp({ initialBooks, colleagues: initialColleagues }: BooksAppProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [colleagues, setColleagues] = useState<Colleague[]>(initialColleagues);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<BookDomain | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "available" | "borrowed" | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check admin status on mount - only if localStorage has valid auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authenticated = localStorage.getItem("admin_authenticated") === "true";
      if (authenticated) {
        setIsAdmin(true);
      } else {
        // Ensure admin is false if not authenticated
        setIsAdmin(false);
      }
    }
  }, []);
  const [modal, setModal] = useState<
    | null
    | { type: "book-details"; book: Book }
    | { type: "borrow"; book: Book }
    | { type: "return-badge-general" }
    | { type: "add" }
    | { type: "edit"; book: Book }
    | { type: "manage-colleagues" }
    | { type: "admin-login" }
  >(null);
  const [toast, setToast] = useState<string | null>(null);

  const refreshColleagues = async () => {
    try {
      const res = await fetch("/api/colleagues", {
        cache: "no-store"
      });
      const payload = await res.json();
      if (res.ok && payload.colleagues) {
        setColleagues(payload.colleagues);
      }
    } catch {
      // Silently fail - colleagues list will refresh on next page load
    }
  };

  const refreshBooks = async () => {
    try {
      const res = await fetch("/api/books", {
        cache: "no-store"
      });
      const payload = await res.json();
      if (res.ok && payload.books) {
        setBooks(payload.books);
        if (payload.colleagues) {
          setColleagues(payload.colleagues);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error refreshing books:", err);
    }
  };

  const filtered = books.filter((b) => {
    if (
      search &&
      !b.title.toLowerCase().includes(search.toLowerCase()) &&
      !b.author.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (domainFilter && !b.domains.includes(domainFilter)) return false;
    if (statusFilter === "available" && b.status !== "available") return false;
    if (statusFilter === "borrowed" && b.status !== "borrowed") return false;
    return true;
  });

  const handleBorrow = (book: Book) => setModal({ type: "borrow", book });
  const handleReturnGeneral = () => setModal({ type: "return-badge-general" });
  const handleEdit = (book: Book) => setModal({ type: "edit", book });

  const confirmBorrow = async (colleague: Colleague, _selectedBook?: Book) => {
    if (!modal || modal.type !== "borrow") return;
    const book = modal.book;

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, colleagueId: colleague.id }),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        const message: string =
          payload?.error ||
          "Unable to borrow this book right now. Please try again.";
        setToast(message);
        setModal(null);
        return;
      }

      const updated = payload.book as Book;

      setBooks((bs) =>
        bs.map((b) =>
          b.id === updated.id
            ? {
                ...b,
                status: updated.status,
                borrowerName: updated.borrowerName,
                borrowedAt: updated.borrowedAt
              }
            : b
        )
      );
      setModal(null);
      setToast(`${colleague.name} borrowed "${book.title}"`);
    } catch {
      setToast("Network error while borrowing. Please try again.");
      setModal(null);
    }
  };

  const confirmReturn = async (book: Book, colleague: Colleague) => {

    try {
      const res = await fetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, colleagueId: colleague.id }),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        const message: string =
          payload?.error ||
          "Unable to return this book right now. Please try again.";
        setToast(message);
        setModal(null);
        return;
      }

      const updated = payload.book as Book;
      // Refetch books to ensure all devices see the update
      await refreshBooks();
      setModal(null);
      setToast(`"${book.title}" has been returned`);
    } catch {
      setToast("Network error while returning. Please try again.");
      setModal(null);
    }
  };

  const handleRemove = async (book: Book) => {
    if (book.status === "borrowed" && book.borrowerName) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(
        `"${book.title}" is currently borrowed by ${book.borrowerName}. Remove anyway?`
      );
      if (!ok) return;
    }

    try {
      const res = await fetch(`/api/books/${encodeURIComponent(book.id)}`, {
        method: "DELETE",
        cache: "no-store"
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(payload?.error ?? "Failed to remove book.");
        return;
      }

      // Refetch books to ensure all devices see the removal
      await refreshBooks();
      setToast(`"${book.title}" removed`);
    } catch {
      setToast("Network error while removing book.");
    }
  };

  const handleAddBook = async (form: {
    title: string;
    author: string;
    synopsis: string;
    coverUrl: string;
    domains: BookDomain[];
    ownerId: string | null;
  }) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          synopsis: form.synopsis,
          coverUrl: form.coverUrl,
          domains: form.domains,
          ownerId: form.ownerId
        }),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        const errorMsg = payload?.error ?? "Failed to add book.";
        const details = payload?.details ? ` Details: ${payload.details}` : "";
        const hint = payload?.hint ? ` Hint: ${payload.hint}` : "";
        // eslint-disable-next-line no-console
        console.error("Add book error:", payload);
        // Show full error in console and toast
        setToast(`${errorMsg}${details}${hint}`);
        // Also log to console for debugging
        // eslint-disable-next-line no-console
        console.error("Full error payload:", JSON.stringify(payload, null, 2));
        return;
      }

      const created = payload.book as Book;
      // Refetch books from database to ensure all devices see the new book
      await refreshBooks();
      setModal(null);
      setToast(`"${created.title}" added to the library`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Network error adding book:", err);
      setToast("Network error while adding book. Please check your connection.");
    }
  };

  const handleSaveEdit = async (
    bookId: string,
    updates: { synopsis: string; domains: BookDomain[]; ownerId: string | null }
  ) => {
    try {
      const res = await fetch(`/api/books/${encodeURIComponent(bookId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          synopsis: updates.synopsis,
          domains: updates.domains,
          ownerId: updates.ownerId
        }),
        cache: "no-store"
      });

      const payload = await res.json();

      if (!res.ok) {
        setToast(payload?.error ?? "Failed to update book.");
        return;
      }

      const updated = payload.book as Book;
      // Refetch books to ensure all devices see the update
      await refreshBooks();
      setModal(null);
      setToast(`"${updated.title}" updated`);
    } catch {
      setToast("Network error while updating book.");
    }
  };

  const totalBooks = books.length;
  const borrowedCount = books.filter((b) => b.status === "borrowed").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                📚 Forge Holidays Library
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Powered by AI</p>
              <p className="text-xs sm:text-sm text-gray-400">
                {totalBooks} books · {borrowedCount} borrowed
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleReturnGeneral}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                ↩ Return
              </button>
              {/* Admin features - only show if authenticated */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => setModal({ type: "add" })}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-900 text-white text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => setModal({ type: "manage-colleagues" })}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    👥 People
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  if (isAdmin) {
                    // Logout
                    setIsAdmin(false);
                    localStorage.removeItem("admin_authenticated");
                    setToast("Logged out");
                  } else {
                    // Always show login modal when not admin
                    setModal({ type: "admin-login" });
                  }
                }}
                className={`px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isAdmin
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {isAdmin ? "Admin ✦" : "Admin"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Search books or authors..."
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() =>
                setStatusFilter((s) => (s === "available" ? null : "available"))
              }
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                statusFilter === "available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {statusFilter === "available" ? "✓ Available" : "Available"}
            </button>
            <button
              onClick={() =>
                setStatusFilter((s) => (s === "borrowed" ? null : "borrowed"))
              }
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                statusFilter === "borrowed"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {statusFilter === "borrowed" ? "✓ Borrowed" : "Borrowed"}
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() =>
                  setDomainFilter((f) => (f === d ? null : d))
                }
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  domainFilter === d
                    ? DOMAIN_COLORS[d]
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">
              No books match your filters
            </p>
            <button
              onClick={() => {
                setSearch("");
                setDomainFilter(null);
                setStatusFilter(null);
              }}
              className="mt-3 text-sm text-gray-900 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                onBorrow={handleBorrow}
                onOpenDetails={(book) => setModal({ type: "book-details", book })}
                isAdmin={isAdmin}
                onRemove={handleRemove}
                onEdit={isAdmin ? handleEdit : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "book-details" && (
        <BookDetailsModal
          book={modal.book}
          onBorrow={(book) => setModal({ type: "borrow", book })}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "borrow" && (
        <ScanBadgeModal
          action="borrow"
          book={modal.book}
          colleagues={colleagues}
          onConfirm={confirmBorrow}
          onCancel={() => setModal(null)}
          onColleagueCreated={(newColleague) => {
            setColleagues((cs) => [...cs, newColleague]);
          }}
        />
      )}
      {modal?.type === "return-badge-general" && (
        <ScanBadgeModal
          action="return"
          book={null}
          colleagues={colleagues}
          books={books}
          onConfirm={(colleague, selectedBook) => {
            if (selectedBook) {
              confirmReturn(selectedBook, colleague);
            }
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "add" && (
        <AddBookModal
          colleagues={colleagues}
          onAdd={handleAddBook}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "edit" && (
        <EditBookModal
          book={modal.book}
          colleagues={colleagues}
          onSave={handleSaveEdit}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "manage-colleagues" && (
        <ManageColleaguesModal
          colleagues={colleagues}
          onUpdate={refreshColleagues}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "admin-login" && (
        <AdminLoginModal
          onLogin={() => {
            setIsAdmin(true);
            setModal(null);
            setToast("Admin access granted");
          }}
          onCancel={() => setModal(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
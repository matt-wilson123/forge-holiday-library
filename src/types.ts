export type BookDomain =
  | "Product"
  | "Engineering"
  | "Data"
  | "Product Design"
  | "Marketing"
  | "People"
  | "Leadership"
  | "Strategy"
  | "AI"
  | "Other";

export type BookStatus = "available" | "borrowed";

export interface Book {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  coverUrl: string | null;
  synopsis: string | null;
  yearPublished: number | null;
  pageCount: number | null;
  domains: BookDomain[];
  status: BookStatus;
  ownerName?: string | null;
  borrowerName?: string | null;
  borrowedAt?: string | null;
}

export interface Colleague {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}


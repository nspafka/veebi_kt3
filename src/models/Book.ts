export interface Book {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number;
  pageCount: number;
  language: string;
  description: string;
  coverImage?: string;
  authorId: number;
  publisherId: number;
  genres: number[];
  createdAt: string;
  updatedAt: string;
}

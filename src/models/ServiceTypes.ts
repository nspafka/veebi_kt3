// Ühised tagastustüübid — sobivad nii mock kui Prisma implementatsioonidele
// Kuupäevad on Date | string, sest Prisma tagastab Date, mock tagastab string

export interface AuthorData {
  id: number;
  firstName: string;
  lastName: string;
  birthYear: number;
  nationality: string;
  biography: string | null;
  createdAt: Date | string;
}

export interface PublisherData {
  id: number;
  name: string;
  country: string;
  foundedYear: number;
  website: string | null;
  createdAt: Date | string;
}

export interface GenreData {
  id: number;
  name: string;
}

export interface BookData {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number;
  pageCount: number;
  language: string;
  description: string;
  coverImage: string | null;
  authorId: number;
  publisherId: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: AuthorData;
  publisher: PublisherData;
  genres: GenreData[];
}

export interface ReviewData {
  id: number;
  bookId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
}

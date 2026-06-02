import { Prisma } from '@prisma/client';
import { BookData } from '../models/ServiceTypes';
import { CreateBookInput, UpdateBookInput } from '../validators/bookValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Käitusaegselt otsustatakse kas kasutada andmebaasi või mock andmeid
const USE_DB = !!process.env.DATABASE_URL;

export type BookWithRelations = BookData;

export interface BookQueryParams {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  year?: string;
  publisher?: string;
  sortBy?: string;
  order?: string;
}

// ─── Mock implementatsioon ────────────────────────────────────────────────────

function getMockBooks(): BookData[] {
  // Impordime mock andmed ja autorid/kirjastused/žanrid suhete jaoks
  const { books, authors, publishers, genres } = require('../data');

  return books.map((b: {
    id: number; title: string; isbn: string; publishedYear: number;
    pageCount: number; language: string; description: string; coverImage?: string;
    authorId: number; publisherId: number; genres: number[];
    createdAt: string; updatedAt: string;
  }): BookData => ({
    ...b,
    coverImage: b.coverImage ?? null,
    author: (() => {
      const a = authors.find((x: { id: number }) => x.id === b.authorId);
      return { ...a, biography: a.biography ?? null };
    })(),
    publisher: (() => {
      const p = publishers.find((x: { id: number }) => x.id === b.publisherId);
      return { ...p, website: p.website ?? null };
    })(),
    genres: genres.filter((g: { id: number }) => b.genres.includes(g.id)),
  }));
}

function applyBookFilters(books: BookData[], params: BookQueryParams): BookData[] {
  let result = [...books];

  if (params.title) {
    const t = params.title.toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(t));
  }
  if (params.author) {
    const a = params.author.toLowerCase();
    result = result.filter((b) =>
      `${b.author.firstName} ${b.author.lastName}`.toLowerCase().includes(a)
    );
  }
  if (params.genre) {
    const g = params.genre.toLowerCase();
    result = result.filter((b) => b.genres.some((x) => x.name.toLowerCase().includes(g)));
  }
  if (params.language) {
    const l = params.language.toLowerCase();
    result = result.filter((b) => b.language.toLowerCase() === l);
  }
  if (params.year) {
    const y = parseInt(params.year);
    if (!isNaN(y)) result = result.filter((b) => b.publishedYear === y);
  }
  if (params.publisher) {
    const p = params.publisher.toLowerCase();
    result = result.filter((b) => b.publisher.name.toLowerCase().includes(p));
  }
  if (params.sortBy === 'title') {
    result.sort((a, b) => {
      const c = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      return params.order === 'desc' ? -c : c;
    });
  } else if (params.sortBy === 'publishedYear') {
    result.sort((a, b) => {
      const c = a.publishedYear - b.publishedYear;
      return params.order === 'desc' ? -c : c;
    });
  }
  return result;
}

// ─── Prisma abifunktsioonid ───────────────────────────────────────────────────

function buildWhereClause(params: BookQueryParams): Prisma.BookWhereInput {
  const where: Prisma.BookWhereInput = {};
  if (params.title) where.title = { contains: params.title, mode: 'insensitive' };
  if (params.author) where.author = {
    OR: [
      { firstName: { contains: params.author, mode: 'insensitive' } },
      { lastName: { contains: params.author, mode: 'insensitive' } },
    ],
  };
  if (params.genre) where.genres = { some: { name: { contains: params.genre, mode: 'insensitive' } } };
  if (params.language) where.language = { equals: params.language, mode: 'insensitive' };
  if (params.year) {
    const y = parseInt(params.year);
    if (!isNaN(y)) where.publishedYear = y;
  }
  if (params.publisher) where.publisher = { name: { contains: params.publisher, mode: 'insensitive' } };
  return where;
}

function buildOrderBy(params: BookQueryParams): Prisma.BookOrderByWithRelationInput {
  if (params.sortBy === 'title') return { title: params.order === 'desc' ? 'desc' : 'asc' };
  if (params.sortBy === 'publishedYear') return { publishedYear: params.order === 'desc' ? 'desc' : 'asc' };
  return { createdAt: 'desc' };
}

const BOOK_INCLUDE = { author: true, publisher: true, genres: true } as const;

// ─── Eksporditud teenuse funktsioonid ─────────────────────────────────────────

export async function getAllBooks(
  params: BookQueryParams,
  page: number,
  limit: number
): Promise<{ data: BookData[]; totalItems: number }> {
  if (!USE_DB) {
    const filtered = applyBookFilters(getMockBooks(), params);
    const totalItems = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return { data, totalItems };
  }

  const prisma = (await import('../lib/prisma')).default;
  const where = buildWhereClause(params);
  const [data, totalItems] = await Promise.all([
    prisma.book.findMany({ where, orderBy: buildOrderBy(params), skip: (page - 1) * limit, take: limit, include: BOOK_INCLUDE }),
    prisma.book.count({ where }),
  ]);
  return { data: data as BookData[], totalItems };
}

export async function getBookById(id: number): Promise<BookData | null> {
  if (!USE_DB) {
    return getMockBooks().find((b) => b.id === id) ?? null;
  }
  const prisma = (await import('../lib/prisma')).default;
  const book = await prisma.book.findUnique({ where: { id }, include: BOOK_INCLUDE });
  return book as BookData | null;
}

export async function getBooksByAuthorId(authorId: number): Promise<BookData[]> {
  if (!USE_DB) return getMockBooks().filter((b) => b.authorId === authorId);
  const prisma = (await import('../lib/prisma')).default;
  const books = await prisma.book.findMany({ where: { authorId }, include: BOOK_INCLUDE });
  return books as BookData[];
}

export async function getBooksByPublisherId(publisherId: number): Promise<BookData[]> {
  if (!USE_DB) return getMockBooks().filter((b) => b.publisherId === publisherId);
  const prisma = (await import('../lib/prisma')).default;
  const books = await prisma.book.findMany({ where: { publisherId }, include: BOOK_INCLUDE });
  return books as BookData[];
}

export async function getBooksByGenreId(genreId: number): Promise<BookData[]> {
  if (!USE_DB) return getMockBooks().filter((b) => b.genres.some((g) => g.id === genreId));
  const prisma = (await import('../lib/prisma')).default;
  const books = await prisma.book.findMany({ where: { genres: { some: { id: genreId } } }, include: BOOK_INCLUDE });
  return books as BookData[];
}

export async function createBook(input: CreateBookInput): Promise<BookData> {
  if (!USE_DB) {
    const { books, authors, publishers, genres } = require('../data');
    const nextId = Math.max(...books.map((b: { id: number }) => b.id)) + 1;
    const now = new Date().toISOString();
    const newBook = { id: nextId, ...input, createdAt: now, updatedAt: now };
    books.push(newBook);
    return getMockBooks().find((b) => b.id === nextId)!;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    const book = await prisma.book.create({
      data: {
        title: input.title, isbn: input.isbn, publishedYear: input.publishedYear,
        pageCount: input.pageCount, language: input.language, description: input.description,
        coverImage: input.coverImage, authorId: input.authorId, publisherId: input.publisherId,
        genres: { connect: input.genres.map((id) => ({ id })) },
      },
      include: BOOK_INCLUDE,
    });
    return book as BookData;
  } catch (e) { return handlePrismaError(e); }
}

export async function updateBook(id: number, input: UpdateBookInput): Promise<BookData | null> {
  if (!USE_DB) {
    const { books } = require('../data');
    const index = books.findIndex((b: { id: number }) => b.id === id);
    if (index === -1) return null;
    books[index] = { ...books[index], ...input, updatedAt: new Date().toISOString() };
    return getMockBooks().find((b) => b.id === id) ?? null;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    const genresUpdate = input.genres ? { genres: { set: input.genres.map((gId) => ({ id: gId })) } } : {};
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.isbn !== undefined && { isbn: input.isbn }),
        ...(input.publishedYear !== undefined && { publishedYear: input.publishedYear }),
        ...(input.pageCount !== undefined && { pageCount: input.pageCount }),
        ...(input.language !== undefined && { language: input.language }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.authorId !== undefined && { authorId: input.authorId }),
        ...(input.publisherId !== undefined && { publisherId: input.publisherId }),
        ...genresUpdate,
      },
      include: BOOK_INCLUDE,
    });
    return book as BookData;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return null;
    return handlePrismaError(e);
  }
}

export async function deleteBook(id: number): Promise<boolean> {
  if (!USE_DB) {
    const { books } = require('../data');
    const index = books.findIndex((b: { id: number }) => b.id === id);
    if (index === -1) return false;
    books.splice(index, 1);
    return true;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return false;
    return handlePrismaError(e);
  }
}

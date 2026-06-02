import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreateBookInput, UpdateBookInput } from '../validators/bookValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Prisma tagastab raamatu koos seotud objektidega — defineerime tüübi Prisma abiga
export type BookWithRelations = Prisma.BookGetPayload<{
  include: { author: true; publisher: true; genres: true };
}>;

// Filtreerimise ja sorteerimise parameetrite tüüp
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

// Ehitab Prisma where klausli query parameetritest
function buildWhereClause(params: BookQueryParams): Prisma.BookWhereInput {
  const where: Prisma.BookWhereInput = {};

  // Pealkirja osaline otsing (ei erista suuri/väikesi tähti)
  if (params.title) {
    where.title = { contains: params.title, mode: 'insensitive' };
  }

  // Autori nime otsing — otsib nii eesnimest kui perekonnanimest
  if (params.author) {
    where.author = {
      OR: [
        { firstName: { contains: params.author, mode: 'insensitive' } },
        { lastName: { contains: params.author, mode: 'insensitive' } },
      ],
    };
  }

  // Žanri otsing — raamat peab kuuluma vähemalt ühte sobivasse žanrisse
  if (params.genre) {
    where.genres = { some: { name: { contains: params.genre, mode: 'insensitive' } } };
  }

  // Keele täpne otsing (ei erista suuri/väikesi tähti)
  if (params.language) {
    where.language = { equals: params.language, mode: 'insensitive' };
  }

  // Avaldamisaasta täpne otsing
  if (params.year) {
    const year = parseInt(params.year);
    if (!isNaN(year)) {
      where.publishedYear = year;
    }
  }

  // Kirjastuse nime osaline otsing
  if (params.publisher) {
    where.publisher = { name: { contains: params.publisher, mode: 'insensitive' } };
  }

  return where;
}

// Ehitab Prisma orderBy klausli sorteerimise parameetritest
function buildOrderBy(params: BookQueryParams): Prisma.BookOrderByWithRelationInput {
  if (params.sortBy === 'title') {
    return { title: params.order === 'desc' ? 'desc' : 'asc' };
  }
  if (params.sortBy === 'publishedYear') {
    return { publishedYear: params.order === 'desc' ? 'desc' : 'asc' };
  }
  // Vaikimisi uuemad ees
  return { createdAt: 'desc' };
}

// Kõikide raamatute päring koos filtreerimise, sorteerimise ja leheküljestamisega
// Tagastab andmed ja koguarvu DB taseme leheküljestamiseks
export async function getAllBooks(
  params: BookQueryParams,
  page: number,
  limit: number
): Promise<{ data: BookWithRelations[]; totalItems: number }> {
  const where = buildWhereClause(params);
  const orderBy = buildOrderBy(params);
  const skip = (page - 1) * limit;

  // Paralleelpäring — andmed ja koguarv korraga efektiivsuse jaoks
  const [data, totalItems] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { author: true, publisher: true, genres: true },
    }),
    prisma.book.count({ where }),
  ]);

  return { data, totalItems };
}

// Ühe raamatu päring ID järgi — tagastab null kui ei leita
export async function getBookById(id: number): Promise<BookWithRelations | null> {
  return prisma.book.findUnique({
    where: { id },
    include: { author: true, publisher: true, genres: true },
  });
}

// Kõik raamatud konkreetse autori järgi
export async function getBooksByAuthorId(authorId: number): Promise<BookWithRelations[]> {
  return prisma.book.findMany({
    where: { authorId },
    include: { author: true, publisher: true, genres: true },
  });
}

// Kõik raamatud konkreetse kirjastuse järgi
export async function getBooksByPublisherId(publisherId: number): Promise<BookWithRelations[]> {
  return prisma.book.findMany({
    where: { publisherId },
    include: { author: true, publisher: true, genres: true },
  });
}

// Kõik raamatud konkreetse žanri järgi
export async function getBooksByGenreId(genreId: number): Promise<BookWithRelations[]> {
  return prisma.book.findMany({
    where: { genres: { some: { id: genreId } } },
    include: { author: true, publisher: true, genres: true },
  });
}

// Uue raamatu loomine — seostab žanrid läbi connect operatsiooni
export async function createBook(input: CreateBookInput): Promise<BookWithRelations> {
  try {
    return await prisma.book.create({
      data: {
        title: input.title,
        isbn: input.isbn,
        publishedYear: input.publishedYear,
        pageCount: input.pageCount,
        language: input.language,
        description: input.description,
        coverImage: input.coverImage,
        authorId: input.authorId,
        publisherId: input.publisherId,
        // N:M seos — ühendame žanrid ID-de järgi
        genres: { connect: input.genres.map((id) => ({ id })) },
      },
      include: { author: true, publisher: true, genres: true },
    });
  } catch (e) {
    return handlePrismaError(e);
  }
}

// Olemasoleva raamatu uuendamine — tagastab null kui raamatut ei leita
export async function updateBook(id: number, input: UpdateBookInput): Promise<BookWithRelations | null> {
  try {
    // Žanrite uuendamine — asendame kõik olemasolevad žanrid uutega (set operatsioon)
    const genresUpdate = input.genres
      ? { genres: { set: input.genres.map((gId) => ({ id: gId })) } }
      : {};

    return await prisma.book.update({
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
      include: { author: true, publisher: true, genres: true },
    });
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return null;
    }
    return handlePrismaError(e);
  }
}

// Raamatu kustutamine — tagastab false kui raamatut ei leita
export async function deleteBook(id: number): Promise<boolean> {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return false;
    }
    return handlePrismaError(e);
  }
}

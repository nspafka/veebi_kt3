import { Author, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreateAuthorInput, UpdateAuthorInput } from '../validators/authorValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Filtreerimise ja sorteerimise parameetrite tüüp
export interface AuthorQueryParams {
  lastName?: string;
  nationality?: string;
  sortBy?: string;
  order?: string;
}

// Kõikide autorite päring koos filtreerimise, sorteerimise ja leheküljestamisega
export async function getAllAuthors(
  params: AuthorQueryParams,
  page: number,
  limit: number
): Promise<{ data: Author[]; totalItems: number }> {
  const where: Prisma.AuthorWhereInput = {};

  // Perekonnanime osaline otsing
  if (params.lastName) {
    where.lastName = { contains: params.lastName, mode: 'insensitive' };
  }

  // Rahvuse osaline otsing
  if (params.nationality) {
    where.nationality = { contains: params.nationality, mode: 'insensitive' };
  }

  // Sorteerimise suund
  const orderBy: Prisma.AuthorOrderByWithRelationInput =
    params.sortBy === 'lastName'
      ? { lastName: params.order === 'desc' ? 'desc' : 'asc' }
      : { createdAt: 'desc' };

  // Paralleelpäring — andmed ja koguarv korraga
  const [data, totalItems] = await Promise.all([
    prisma.author.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.author.count({ where }),
  ]);

  return { data, totalItems };
}

// Ühe autori päring ID järgi
export async function getAuthorById(id: number): Promise<Author | null> {
  return prisma.author.findUnique({ where: { id } });
}

// Uue autori loomine
export async function createAuthor(input: CreateAuthorInput): Promise<Author> {
  return prisma.author.create({ data: input });
}

// Autori uuendamine — tagastab null kui ei leita
export async function updateAuthor(id: number, input: UpdateAuthorInput): Promise<Author | null> {
  try {
    return await prisma.author.update({ where: { id }, data: input });
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return null;
    }
    return handlePrismaError(e);
  }
}

// Autori kustutamine — tagastab false kui ei leita
export async function deleteAuthor(id: number): Promise<boolean> {
  try {
    await prisma.author.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return false;
    }
    return handlePrismaError(e);
  }
}

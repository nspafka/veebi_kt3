import { Prisma } from '@prisma/client';
import { AuthorData } from '../models/ServiceTypes';
import { CreateAuthorInput, UpdateAuthorInput } from '../validators/authorValidator';
import { handlePrismaError } from '../utils/prismaErrors';

const USE_DB = !!process.env.DATABASE_URL;

export type { AuthorData };

export interface AuthorQueryParams {
  lastName?: string;
  nationality?: string;
  sortBy?: string;
  order?: string;
}

// ─── Mock implementatsioon ────────────────────────────────────────────────────

function getMockAuthors(): AuthorData[] {
  const { authors } = require('../data');
  return authors.map((a: {
    id: number; firstName: string; lastName: string; birthYear: number;
    nationality: string; biography?: string; createdAt: string;
  }): AuthorData => ({ ...a, biography: a.biography ?? null }));
}

// ─── Eksporditud teenuse funktsioonid ─────────────────────────────────────────

export async function getAllAuthors(
  params: AuthorQueryParams,
  page: number,
  limit: number
): Promise<{ data: AuthorData[]; totalItems: number }> {
  if (!USE_DB) {
    let result = getMockAuthors();
    if (params.lastName) {
      const l = params.lastName.toLowerCase();
      result = result.filter((a) => a.lastName.toLowerCase().includes(l));
    }
    if (params.nationality) {
      const n = params.nationality.toLowerCase();
      result = result.filter((a) => a.nationality.toLowerCase().includes(n));
    }
    if (params.sortBy === 'lastName') {
      result.sort((a, b) => {
        const c = a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
        return params.order === 'desc' ? -c : c;
      });
    }
    const totalItems = result.length;
    return { data: result.slice((page - 1) * limit, page * limit), totalItems };
  }

  const prisma = (await import('../lib/prisma')).default;
  const where: Prisma.AuthorWhereInput = {};
  if (params.lastName) where.lastName = { contains: params.lastName, mode: 'insensitive' };
  if (params.nationality) where.nationality = { contains: params.nationality, mode: 'insensitive' };
  const orderBy: Prisma.AuthorOrderByWithRelationInput =
    params.sortBy === 'lastName' ? { lastName: params.order === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' };
  const [data, totalItems] = await Promise.all([
    prisma.author.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.author.count({ where }),
  ]);
  return { data: data as AuthorData[], totalItems };
}

export async function getAuthorById(id: number): Promise<AuthorData | null> {
  if (!USE_DB) return getMockAuthors().find((a) => a.id === id) ?? null;
  const prisma = (await import('../lib/prisma')).default;
  const author = await prisma.author.findUnique({ where: { id } });
  return author as AuthorData | null;
}

export async function createAuthor(input: CreateAuthorInput): Promise<AuthorData> {
  if (!USE_DB) {
    const { authors } = require('../data');
    const nextId = Math.max(...authors.map((a: { id: number }) => a.id)) + 1;
    const newAuthor = { id: nextId, ...input, biography: input.biography ?? null, createdAt: new Date().toISOString() };
    authors.push(newAuthor);
    return newAuthor;
  }
  const prisma = (await import('../lib/prisma')).default;
  const author = await prisma.author.create({ data: input });
  return author as AuthorData;
}

export async function updateAuthor(id: number, input: UpdateAuthorInput): Promise<AuthorData | null> {
  if (!USE_DB) {
    const { authors } = require('../data');
    const index = authors.findIndex((a: { id: number }) => a.id === id);
    if (index === -1) return null;
    authors[index] = { ...authors[index], ...input };
    return getMockAuthors().find((a) => a.id === id) ?? null;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    const author = await prisma.author.update({ where: { id }, data: input });
    return author as AuthorData;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return null;
    return handlePrismaError(e);
  }
}

export async function deleteAuthor(id: number): Promise<boolean> {
  if (!USE_DB) {
    const { authors } = require('../data');
    const index = authors.findIndex((a: { id: number }) => a.id === id);
    if (index === -1) return false;
    authors.splice(index, 1);
    return true;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    await prisma.author.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return false;
    return handlePrismaError(e);
  }
}

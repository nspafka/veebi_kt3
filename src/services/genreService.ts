import { GenreData } from '../models/ServiceTypes';
import { CreateGenreInput } from '../validators/genreValidator';
import { handlePrismaError } from '../utils/prismaErrors';

const USE_DB = !!process.env.DATABASE_URL;

export type { GenreData };

// ─── Mock implementatsioon ────────────────────────────────────────────────────

function getMockGenres(): GenreData[] {
  const { genres } = require('../data');
  return genres as GenreData[];
}

// ─── Eksporditud teenuse funktsioonid ─────────────────────────────────────────

export async function getAllGenres(): Promise<GenreData[]> {
  if (!USE_DB) return [...getMockGenres()].sort((a, b) => a.name.localeCompare(b.name));
  const prisma = (await import('../lib/prisma')).default;
  return prisma.genre.findMany({ orderBy: { name: 'asc' } }) as Promise<GenreData[]>;
}

export async function getGenreById(id: number): Promise<GenreData | null> {
  if (!USE_DB) return getMockGenres().find((g) => g.id === id) ?? null;
  const prisma = (await import('../lib/prisma')).default;
  return prisma.genre.findUnique({ where: { id } }) as Promise<GenreData | null>;
}

export async function genreNameExists(name: string): Promise<boolean> {
  if (!USE_DB) return getMockGenres().some((g) => g.name.toLowerCase() === name.toLowerCase());
  const prisma = (await import('../lib/prisma')).default;
  const existing = await prisma.genre.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
  return existing !== null;
}

export async function createGenre(input: CreateGenreInput): Promise<GenreData> {
  if (!USE_DB) {
    const { genres } = require('../data');
    const nextId = Math.max(...genres.map((g: { id: number }) => g.id)) + 1;
    const newGenre: GenreData = { id: nextId, name: input.name };
    genres.push(newGenre);
    return newGenre;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    return prisma.genre.create({ data: { name: input.name } }) as Promise<GenreData>;
  } catch (e) { return handlePrismaError(e); }
}

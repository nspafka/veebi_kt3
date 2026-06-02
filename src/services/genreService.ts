import { Genre } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreateGenreInput } from '../validators/genreValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Kõikide žanrite päring — žanreid on vähe, leheküljestamine pole vajalik
export async function getAllGenres(): Promise<Genre[]> {
  return prisma.genre.findMany({ orderBy: { name: 'asc' } });
}

// Ühe žanri päring ID järgi
export async function getGenreById(id: number): Promise<Genre | null> {
  return prisma.genre.findUnique({ where: { id } });
}

// Kontrollib, kas sama nimega žanr on juba andmebaasis
export async function genreNameExists(name: string): Promise<boolean> {
  const existing = await prisma.genre.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
  return existing !== null;
}

// Uue žanri loomine
export async function createGenre(input: CreateGenreInput): Promise<Genre> {
  try {
    return await prisma.genre.create({ data: { name: input.name } });
  } catch (e) {
    return handlePrismaError(e);
  }
}

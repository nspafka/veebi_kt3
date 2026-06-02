import { Publisher, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreatePublisherInput, UpdatePublisherInput } from '../validators/publisherValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Filtreerimise parameetrite tüüp
export interface PublisherQueryParams {
  name?: string;
  country?: string;
}

// Kõikide kirjastuste päring koos filtreerimise ja leheküljestamisega
export async function getAllPublishers(
  params: PublisherQueryParams,
  page: number,
  limit: number
): Promise<{ data: Publisher[]; totalItems: number }> {
  const where: Prisma.PublisherWhereInput = {};

  // Nime osaline otsing
  if (params.name) {
    where.name = { contains: params.name, mode: 'insensitive' };
  }

  // Riigi osaline otsing
  if (params.country) {
    where.country = { contains: params.country, mode: 'insensitive' };
  }

  const [data, totalItems] = await Promise.all([
    prisma.publisher.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publisher.count({ where }),
  ]);

  return { data, totalItems };
}

// Ühe kirjastuse päring ID järgi
export async function getPublisherById(id: number): Promise<Publisher | null> {
  return prisma.publisher.findUnique({ where: { id } });
}

// Uue kirjastuse loomine
export async function createPublisher(input: CreatePublisherInput): Promise<Publisher> {
  return prisma.publisher.create({ data: input });
}

// Kirjastuse uuendamine — tagastab null kui ei leita
export async function updatePublisher(id: number, input: UpdatePublisherInput): Promise<Publisher | null> {
  try {
    return await prisma.publisher.update({ where: { id }, data: input });
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return null;
    }
    return handlePrismaError(e);
  }
}

// Kirjastuse kustutamine — tagastab false kui ei leita
export async function deletePublisher(id: number): Promise<boolean> {
  try {
    await prisma.publisher.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return false;
    }
    return handlePrismaError(e);
  }
}

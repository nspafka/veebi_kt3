import { Prisma } from '@prisma/client';
import { PublisherData } from '../models/ServiceTypes';
import { CreatePublisherInput, UpdatePublisherInput } from '../validators/publisherValidator';
import { handlePrismaError } from '../utils/prismaErrors';

const USE_DB = !!process.env.DATABASE_URL;

export type { PublisherData };

export interface PublisherQueryParams {
  name?: string;
  country?: string;
}

// ─── Mock implementatsioon ────────────────────────────────────────────────────

function getMockPublishers(): PublisherData[] {
  const { publishers } = require('../data');
  return publishers.map((p: {
    id: number; name: string; country: string; foundedYear: number;
    website?: string; createdAt: string;
  }): PublisherData => ({ ...p, website: p.website ?? null }));
}

// ─── Eksporditud teenuse funktsioonid ─────────────────────────────────────────

export async function getAllPublishers(
  params: PublisherQueryParams,
  page: number,
  limit: number
): Promise<{ data: PublisherData[]; totalItems: number }> {
  if (!USE_DB) {
    let result = getMockPublishers();
    if (params.name) {
      const n = params.name.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(n));
    }
    if (params.country) {
      const c = params.country.toLowerCase();
      result = result.filter((p) => p.country.toLowerCase().includes(c));
    }
    const totalItems = result.length;
    return { data: result.slice((page - 1) * limit, page * limit), totalItems };
  }

  const prisma = (await import('../lib/prisma')).default;
  const where: Prisma.PublisherWhereInput = {};
  if (params.name) where.name = { contains: params.name, mode: 'insensitive' };
  if (params.country) where.country = { contains: params.country, mode: 'insensitive' };
  const [data, totalItems] = await Promise.all([
    prisma.publisher.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit }),
    prisma.publisher.count({ where }),
  ]);
  return { data: data as PublisherData[], totalItems };
}

export async function getPublisherById(id: number): Promise<PublisherData | null> {
  if (!USE_DB) return getMockPublishers().find((p) => p.id === id) ?? null;
  const prisma = (await import('../lib/prisma')).default;
  const publisher = await prisma.publisher.findUnique({ where: { id } });
  return publisher as PublisherData | null;
}

export async function createPublisher(input: CreatePublisherInput): Promise<PublisherData> {
  if (!USE_DB) {
    const { publishers } = require('../data');
    const nextId = Math.max(...publishers.map((p: { id: number }) => p.id)) + 1;
    const newPublisher = { id: nextId, ...input, website: input.website ?? null, createdAt: new Date().toISOString() };
    publishers.push(newPublisher);
    return newPublisher;
  }
  const prisma = (await import('../lib/prisma')).default;
  const publisher = await prisma.publisher.create({ data: input });
  return publisher as PublisherData;
}

export async function updatePublisher(id: number, input: UpdatePublisherInput): Promise<PublisherData | null> {
  if (!USE_DB) {
    const { publishers } = require('../data');
    const index = publishers.findIndex((p: { id: number }) => p.id === id);
    if (index === -1) return null;
    publishers[index] = { ...publishers[index], ...input };
    return getMockPublishers().find((p) => p.id === id) ?? null;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    const publisher = await prisma.publisher.update({ where: { id }, data: input });
    return publisher as PublisherData;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return null;
    return handlePrismaError(e);
  }
}

export async function deletePublisher(id: number): Promise<boolean> {
  if (!USE_DB) {
    const { publishers } = require('../data');
    const index = publishers.findIndex((p: { id: number }) => p.id === id);
    if (index === -1) return false;
    publishers.splice(index, 1);
    return true;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    await prisma.publisher.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return false;
    return handlePrismaError(e);
  }
}

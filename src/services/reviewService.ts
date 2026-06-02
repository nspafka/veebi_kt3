import { Prisma } from '@prisma/client';
import { ReviewData } from '../models/ServiceTypes';
import { CreateReviewInput, UpdateReviewInput } from '../validators/reviewValidator';
import { handlePrismaError } from '../utils/prismaErrors';

const USE_DB = !!process.env.DATABASE_URL;

export type { ReviewData };

export interface ReviewQueryParams {
  rating?: string;
  sortBy?: string;
  order?: string;
}

// ─── Mock implementatsioon ────────────────────────────────────────────────────

function getMockReviews(): ReviewData[] {
  const { reviews } = require('../data');
  return reviews as ReviewData[];
}

// ─── Eksporditud teenuse funktsioonid ─────────────────────────────────────────

export async function getReviewsByBookId(bookId: number, params: ReviewQueryParams = {}): Promise<ReviewData[]> {
  if (!USE_DB) {
    let result = getMockReviews().filter((r) => r.bookId === bookId);
    if (params.rating) {
      const rating = parseInt(params.rating);
      if (!isNaN(rating)) result = result.filter((r) => r.rating === rating);
    }
    if (params.sortBy === 'createdAt') {
      result.sort((a, b) => {
        const c = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return params.order === 'asc' ? c : -c;
      });
    }
    return result;
  }

  const prisma = (await import('../lib/prisma')).default;
  const where: Prisma.ReviewWhereInput = { bookId };
  if (params.rating) {
    const rating = parseInt(params.rating);
    if (!isNaN(rating)) where.rating = rating;
  }
  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    params.sortBy === 'createdAt' ? { createdAt: params.order === 'asc' ? 'asc' : 'desc' } : { createdAt: 'desc' };
  const reviews = await prisma.review.findMany({ where, orderBy });
  return reviews as ReviewData[];
}

export async function getReviewById(id: number): Promise<ReviewData | null> {
  if (!USE_DB) return getMockReviews().find((r) => r.id === id) ?? null;
  const prisma = (await import('../lib/prisma')).default;
  const review = await prisma.review.findUnique({ where: { id } });
  return review as ReviewData | null;
}

export async function getAverageRating(bookId: number): Promise<number | null> {
  if (!USE_DB) {
    const bookReviews = getMockReviews().filter((r) => r.bookId === bookId);
    if (bookReviews.length === 0) return null;
    const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / bookReviews.length) * 100) / 100;
  }
  const prisma = (await import('../lib/prisma')).default;
  const result = await prisma.review.aggregate({ where: { bookId }, _avg: { rating: true }, _count: { rating: true } });
  if (result._count.rating === 0) return null;
  return result._avg.rating !== null ? Math.round(result._avg.rating * 100) / 100 : null;
}

export async function createReview(bookId: number, input: CreateReviewInput): Promise<ReviewData> {
  if (!USE_DB) {
    const { reviews } = require('../data');
    const nextId = Math.max(...reviews.map((r: { id: number }) => r.id)) + 1;
    const newReview: ReviewData = { id: nextId, bookId, ...input, createdAt: new Date().toISOString() };
    reviews.push(newReview);
    return newReview;
  }
  const prisma = (await import('../lib/prisma')).default;
  const review = await prisma.review.create({ data: { bookId, ...input } });
  return review as ReviewData;
}

export async function updateReview(id: number, input: UpdateReviewInput): Promise<ReviewData | null> {
  if (!USE_DB) {
    const { reviews } = require('../data');
    const index = reviews.findIndex((r: { id: number }) => r.id === id);
    if (index === -1) return null;
    reviews[index] = { ...reviews[index], ...input };
    return getMockReviews().find((r) => r.id === id) ?? null;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    const review = await prisma.review.update({ where: { id }, data: input });
    return review as ReviewData;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return null;
    return handlePrismaError(e);
  }
}

export async function deleteReview(id: number): Promise<boolean> {
  if (!USE_DB) {
    const { reviews } = require('../data');
    const index = reviews.findIndex((r: { id: number }) => r.id === id);
    if (index === -1) return false;
    reviews.splice(index, 1);
    return true;
  }
  const prisma = (await import('../lib/prisma')).default;
  try {
    await prisma.review.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') return false;
    return handlePrismaError(e);
  }
}

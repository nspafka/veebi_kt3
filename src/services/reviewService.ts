import { Review, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreateReviewInput, UpdateReviewInput } from '../validators/reviewValidator';
import { handlePrismaError } from '../utils/prismaErrors';

// Filtreerimise ja sorteerimise parameetrite tüüp
export interface ReviewQueryParams {
  rating?: string;
  sortBy?: string;
  order?: string;
}

// Kõik arvustused konkreetsele raamatule koos filtreerimise ja sorteerimisega
export async function getReviewsByBookId(bookId: number, params: ReviewQueryParams = {}): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = { bookId };

  // Hinde täpne filter
  if (params.rating) {
    const rating = parseInt(params.rating);
    if (!isNaN(rating)) {
      where.rating = rating;
    }
  }

  // Sorteerimine loomisaja järgi — vaikimisi uuemad ees
  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    params.sortBy === 'createdAt'
      ? { createdAt: params.order === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

  return prisma.review.findMany({ where, orderBy });
}

// Ühe arvustuse päring ID järgi
export async function getReviewById(id: number): Promise<Review | null> {
  return prisma.review.findUnique({ where: { id } });
}

// Keskmise hinde arvutamine Prisma agregatsiooniga
export async function getAverageRating(bookId: number): Promise<number | null> {
  const result = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // Tagastame null kui arvustusi pole
  if (result._count.rating === 0) return null;

  // Ümardame kahe kümnendkohani
  const avg = result._avg.rating;
  return avg !== null ? Math.round(avg * 100) / 100 : null;
}

// Uue arvustuse loomine
export async function createReview(bookId: number, input: CreateReviewInput): Promise<Review> {
  return prisma.review.create({
    data: { bookId, ...input },
  });
}

// Arvustuse uuendamine — tagastab null kui ei leita
export async function updateReview(id: number, input: UpdateReviewInput): Promise<Review | null> {
  try {
    return await prisma.review.update({ where: { id }, data: input });
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return null;
    }
    return handlePrismaError(e);
  }
}

// Arvustuse kustutamine — tagastab false kui ei leita
export async function deleteReview(id: number): Promise<boolean> {
  try {
    await prisma.review.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2025') {
      return false;
    }
    return handlePrismaError(e);
  }
}

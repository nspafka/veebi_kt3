import { Review } from '../models/Review';
import { reviews } from '../data';
import { CreateReviewInput, UpdateReviewInput } from '../validators/reviewValidator';

// Järgmise ID jaoks
let nextId = Math.max(...reviews.map((r) => r.id)) + 1;

// Filtreerimise ja sorteerimise parameetrite tüüp
export interface ReviewQueryParams {
  rating?: string;
  sortBy?: string;
  order?: string;
}

// Kõik arvustused kindlale raamatule koos filtreerimise ja sorteerimisega
export function getReviewsByBookId(bookId: number, params: ReviewQueryParams = {}): Review[] {
  let result = reviews.filter((r) => r.bookId === bookId);

  // Filtreerimine hinde järgi — täpne vaste
  if (params.rating) {
    const rating = parseInt(params.rating);
    if (!isNaN(rating)) {
      result = result.filter((r) => r.rating === rating);
    }
  }

  // Sorteerimine loomisaja järgi
  if (params.sortBy === 'createdAt') {
    result.sort((a, b) => {
      // Teisendame kuupäevad arvudeks võrdluseks
      const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return params.order === 'desc' ? -comparison : comparison;
    });
  }

  return result;
}

// Ühe arvustuse otsimine ID järgi
export function getReviewById(id: number): Review | undefined {
  return reviews.find((r) => r.id === id);
}

// Keskmise hinde arvutamine — tagastab null kui arvustusi pole
export function getAverageRating(bookId: number): number | null {
  const bookReviews = reviews.filter((r) => r.bookId === bookId);
  if (bookReviews.length === 0) return null;

  // Liidame kõik hinded kokku ja jagame arvustuste arvuga
  const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / bookReviews.length;

  // Ümardame kahe kümnendkohani
  return Math.round(average * 100) / 100;
}

// Uue arvustuse lisamine
export function createReview(bookId: number, input: CreateReviewInput): Review {
  const newReview: Review = {
    id: nextId++,
    bookId,
    ...input,
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  return newReview;
}

// Arvustuse uuendamine
export function updateReview(id: number, input: UpdateReviewInput): Review | undefined {
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const updated: Review = { ...reviews[index], ...input };
  reviews[index] = updated;
  return updated;
}

// Arvustuse kustutamine
export function deleteReview(id: number): boolean {
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return false;

  reviews.splice(index, 1);
  return true;
}

import { Review } from '../models/Review';
import { reviews } from '../data';
import { CreateReviewInput, UpdateReviewInput } from '../validators/reviewValidator';

// Järgmise ID jaoks
let nextId = Math.max(...reviews.map((r) => r.id)) + 1;

// Kõik arvustused kindlale raamatule
export function getReviewsByBookId(bookId: number): Review[] {
  return reviews.filter((r) => r.bookId === bookId);
}

// Ühe arvustuse otsimine ID järgi
export function getReviewById(id: number): Review | undefined {
  return reviews.find((r) => r.id === id);
}

// Keskmise hinde arvutamine — tagastab null kui arvustusi pole
export function getAverageRating(bookId: number): number | null {
  const bookReviews = getReviewsByBookId(bookId);
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

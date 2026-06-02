import { Router, Request, Response } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByAuthorId,
  getBooksByPublisherId,
  BookQueryParams,
} from '../services/bookService';
import { getReviewsByBookId, getAverageRating, createReview } from '../services/reviewService';
import { createBookSchema, updateBookSchema } from '../validators/bookValidator';
import { createReviewSchema } from '../validators/reviewValidator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/v1/books — raamatute nimekiri koos filtreerimise, sorteerimise ja leheküljestamisega
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const params: BookQueryParams = {
    title: req.query.title as string | undefined,
    author: req.query.author as string | undefined,
    genre: req.query.genre as string | undefined,
    language: req.query.language as string | undefined,
    year: req.query.year as string | undefined,
    publisher: req.query.publisher as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    order: req.query.order as string | undefined,
  };

  const { page, limit } = parsePagination(req.query.page, req.query.limit);
  const { data, totalItems } = await getAllBooks(params, page, limit);
  const pagination = buildPaginationMeta(totalItems, page, limit);

  res.json({ data, pagination });
}));

// GET /api/v1/books/:id — ühe raamatu andmed koos autori, kirjastuse ja žanritega
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const book = await getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  res.json(book);
}));

// POST /api/v1/books — uue raamatu lisamine
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const result = createBookSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newBook = await createBook(result.data);
  res.status(201).json(newBook);
}));

// PUT /api/v1/books/:id — raamatu uuendamine
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updateBookSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = await updateBook(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  res.json(updated);
}));

// DELETE /api/v1/books/:id — raamatu kustutamine (kustutab ka arvustused kaskaadiga)
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = await deleteBook(id);
  if (!deleted) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  res.status(204).send();
}));

// POST /api/v1/books/:id/reviews — uue arvustuse lisamine
router.post('/:id/reviews', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime et raamat eksisteerib enne arvustuse lisamist
  const book = await getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newReview = await createReview(id, result.data);
  res.status(201).json(newReview);
}));

// GET /api/v1/books/:id/reviews — arvustused filtreerimise ja sorteerimisega
router.get('/:id/reviews', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const book = await getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  const reviews = await getReviewsByBookId(id, {
    rating: req.query.rating as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    order: req.query.order as string | undefined,
  });

  res.json(reviews);
}));

// GET /api/v1/books/:id/average-rating — keskmise hinde arvutamine Prisma agregatsiooniga
router.get('/:id/average-rating', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const book = await getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  const averageRating = await getAverageRating(id);
  res.json({ bookId: id, averageRating });
}));

// Eksportime abifunktsioonid teiste marsruutide jaoks
export { getBooksByAuthorId, getBooksByPublisherId };

export default router;

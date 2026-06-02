import { Router, Request, Response } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../services/bookService';
import { getReviewsByBookId, getAverageRating } from '../services/reviewService';
import { createBookSchema, updateBookSchema } from '../validators/bookValidator';
import { authors } from '../data';
import { publishers } from '../data';

const router = Router();

// GET /api/v1/books — kõikide raamatute nimekiri
router.get('/', (_req: Request, res: Response) => {
  const allBooks = getAllBooks();
  res.json(allBooks);
});

// GET /api/v1/books/:id — ühe raamatu andmed ID järgi
router.get('/:id', (req: Request, res: Response) => {
  // Teisendame URL parameetri numbriks
  const id = parseInt(req.params.id);

  // Kontrollime, et ID on kehtiv number
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const book = getBookById(id);

  // Kui raamatut ei leitud, tagastame 404
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  res.json(book);
});

// POST /api/v1/books — uue raamatu lisamine
router.post('/', (req: Request, res: Response) => {
  // Valideerime sisendi Zodiga
  const result = createBookSchema.safeParse(req.body);

  if (!result.success) {
    // Teisendame Zod vead ühtse formaadi järgi
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  // Kontrollime, et autor olemas on
  const authorExists = authors.some((a) => a.id === result.data.authorId);
  if (!authorExists) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  // Kontrollime, et kirjastus olemas on
  const publisherExists = publishers.some((p) => p.id === result.data.publisherId);
  if (!publisherExists) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  const newBook = createBook(result.data);

  // 201 Created — uus ressurss loodud edukalt
  res.status(201).json(newBook);
});

// PUT /api/v1/books/:id — olemasoleva raamatu uuendamine
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Valideerime uuenduse andmed — kõik väljad on valikulised
  const result = updateBookSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  // Kui authorId muudetakse, kontrollime et uus autor olemas on
  if (result.data.authorId !== undefined) {
    const authorExists = authors.some((a) => a.id === result.data.authorId);
    if (!authorExists) {
      res.status(404).json({ error: 'Autorit ei leitud' });
      return;
    }
  }

  // Kui publisherId muudetakse, kontrollime et uus kirjastus olemas on
  if (result.data.publisherId !== undefined) {
    const publisherExists = publishers.some((p) => p.id === result.data.publisherId);
    if (!publisherExists) {
      res.status(404).json({ error: 'Kirjastust ei leitud' });
      return;
    }
  }

  const updated = updateBook(id, result.data);

  if (!updated) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  res.json(updated);
});

// DELETE /api/v1/books/:id — raamatu kustutamine
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = deleteBook(id);

  if (!deleted) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  // 204 No Content — kustutamine õnnestus, vastus on tühi
  res.status(204).send();
});

// GET /api/v1/books/:id/reviews — kõik arvustused konkreetsele raamatule
router.get('/:id/reviews', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime esmalt et raamat üldse eksisteerib
  const book = getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  const bookReviews = getReviewsByBookId(id);
  res.json(bookReviews);
});

// GET /api/v1/books/:id/average-rating — raamatu keskmise hinde arvutamine
router.get('/:id/average-rating', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime esmalt et raamat üldse eksisteerib
  const book = getBookById(id);
  if (!book) {
    res.status(404).json({ error: 'Raamatut ei leitud' });
    return;
  }

  const average = getAverageRating(id);
  res.json({ bookId: id, averageRating: average });
});

export default router;

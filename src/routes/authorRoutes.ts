import { Router, Request, Response } from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../services/authorService';
import { getAllBooks } from '../services/bookService';
import { createAuthorSchema, updateAuthorSchema } from '../validators/authorValidator';

const router = Router();

// GET /api/v1/authors — kõikide autorite nimekiri
router.get('/', (_req: Request, res: Response) => {
  const allAuthors = getAllAuthors();
  res.json(allAuthors);
});

// GET /api/v1/authors/:id — ühe autori andmed
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const author = getAuthorById(id);

  if (!author) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.json(author);
});

// POST /api/v1/authors — uue autori lisamine
router.post('/', (req: Request, res: Response) => {
  const result = createAuthorSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newAuthor = createAuthor(result.data);
  res.status(201).json(newAuthor);
});

// PUT /api/v1/authors/:id — autori andmete uuendamine
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updateAuthorSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = updateAuthor(id, result.data);

  if (!updated) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.json(updated);
});

// DELETE /api/v1/authors/:id — autori kustutamine
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = deleteAuthor(id);

  if (!deleted) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.status(204).send();
});

// GET /api/v1/authors/:id/books — kõik raamatud konkreetselt autorilt
router.get('/:id/books', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime et autor eksisteerib enne raamatute otsimist
  const author = getAuthorById(id);
  if (!author) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  // Filtreerime kõikidest raamatutest selle autori omad
  const authorBooks = getAllBooks().filter((b) => b.authorId === id);
  res.json(authorBooks);
});

export default router;

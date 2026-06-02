import { Router, Request, Response } from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  AuthorQueryParams,
} from '../services/authorService';
import { getBooksByAuthorId } from '../services/bookService';
import { createAuthorSchema, updateAuthorSchema } from '../validators/authorValidator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/v1/authors — autorite nimekiri filtreerimise ja leheküljestamisega
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const params: AuthorQueryParams = {
    lastName: req.query.lastName as string | undefined,
    nationality: req.query.nationality as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    order: req.query.order as string | undefined,
  };

  const { page, limit } = parsePagination(req.query.page, req.query.limit);
  const { data, totalItems } = await getAllAuthors(params, page, limit);
  const pagination = buildPaginationMeta(totalItems, page, limit);

  res.json({ data, pagination });
}));

// GET /api/v1/authors/:id — ühe autori andmed
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const author = await getAuthorById(id);
  if (!author) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.json(author);
}));

// POST /api/v1/authors — uue autori lisamine
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const result = createAuthorSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newAuthor = await createAuthor(result.data);
  res.status(201).json(newAuthor);
}));

// PUT /api/v1/authors/:id — autori uuendamine
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updateAuthorSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = await updateAuthor(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.json(updated);
}));

// DELETE /api/v1/authors/:id — autori kustutamine
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = await deleteAuthor(id);
  if (!deleted) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  res.status(204).send();
}));

// GET /api/v1/authors/:id/books — kõik selle autori raamatud
router.get('/:id/books', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const author = await getAuthorById(id);
  if (!author) {
    res.status(404).json({ error: 'Autorit ei leitud' });
    return;
  }

  const books = await getBooksByAuthorId(id);
  res.json(books);
}));

export default router;

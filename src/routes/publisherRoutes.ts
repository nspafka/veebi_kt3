import { Router, Request, Response } from 'express';
import {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  PublisherQueryParams,
} from '../services/publisherService';
import { getBooksByPublisherId } from '../services/bookService';
import { createPublisherSchema, updatePublisherSchema } from '../validators/publisherValidator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/v1/publishers — kirjastuste nimekiri filtreerimise ja leheküljestamisega
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const params: PublisherQueryParams = {
    name: req.query.name as string | undefined,
    country: req.query.country as string | undefined,
  };

  const { page, limit } = parsePagination(req.query.page, req.query.limit);
  const { data, totalItems } = await getAllPublishers(params, page, limit);
  const pagination = buildPaginationMeta(totalItems, page, limit);

  res.json({ data, pagination });
}));

// GET /api/v1/publishers/:id — ühe kirjastuse andmed
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const publisher = await getPublisherById(id);
  if (!publisher) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.json(publisher);
}));

// POST /api/v1/publishers — uue kirjastuse lisamine
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const result = createPublisherSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newPublisher = await createPublisher(result.data);
  res.status(201).json(newPublisher);
}));

// PUT /api/v1/publishers/:id — kirjastuse uuendamine
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updatePublisherSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = await updatePublisher(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.json(updated);
}));

// DELETE /api/v1/publishers/:id — kirjastuse kustutamine
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = await deletePublisher(id);
  if (!deleted) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.status(204).send();
}));

// GET /api/v1/publishers/:id/books — kõik selle kirjastuse raamatud
router.get('/:id/books', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const publisher = await getPublisherById(id);
  if (!publisher) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  const books = await getBooksByPublisherId(id);
  res.json(books);
}));

export default router;

import { Router, Request, Response } from 'express';
import {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  PublisherQueryParams,
} from '../services/publisherService';
import { getAllBooks } from '../services/bookService';
import { createPublisherSchema, updatePublisherSchema } from '../validators/publisherValidator';
import { parsePagination, paginate } from '../utils/pagination';

const router = Router();

// GET /api/v1/publishers — kirjastuste nimekiri koos filtreerimise ja leheküljestamisega
router.get('/', (req: Request, res: Response) => {
  const params: PublisherQueryParams = {
    name: req.query.name as string | undefined,
    country: req.query.country as string | undefined,
  };

  const filtered = getAllPublishers(params);

  // Leheküljestamine kirjastuste nimekirjale
  const { page, limit } = parsePagination(req.query.page, req.query.limit);
  const result = paginate(filtered, page, limit);

  res.json(result);
});

// GET /api/v1/publishers/:id — ühe kirjastuse andmed
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const publisher = getPublisherById(id);

  if (!publisher) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.json(publisher);
});

// POST /api/v1/publishers — uue kirjastuse lisamine
router.post('/', (req: Request, res: Response) => {
  const result = createPublisherSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const newPublisher = createPublisher(result.data);
  res.status(201).json(newPublisher);
});

// PUT /api/v1/publishers/:id — kirjastuse andmete uuendamine
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updatePublisherSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = updatePublisher(id, result.data);

  if (!updated) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.json(updated);
});

// DELETE /api/v1/publishers/:id — kirjastuse kustutamine
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = deletePublisher(id);

  if (!deleted) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  res.status(204).send();
});

// GET /api/v1/publishers/:id/books — kõik raamatud konkreetselt kirjastuselt
router.get('/:id/books', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime et kirjastus eksisteerib enne raamatute otsimist
  const publisher = getPublisherById(id);
  if (!publisher) {
    res.status(404).json({ error: 'Kirjastust ei leitud' });
    return;
  }

  // Filtreerime kõikidest raamatutest selle kirjastuse omad
  const publisherBooks = getAllBooks().filter((b) => b.publisherId === id);
  res.json(publisherBooks);
});

export default router;

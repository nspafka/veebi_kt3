import { Router, Request, Response } from 'express';
import { getAllGenres, getGenreById, createGenre, genreNameExists } from '../services/genreService';
import { getBooksByGenreId } from '../services/bookService';
import { createGenreSchema } from '../validators/genreValidator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// GET /api/v1/genres — kõikide žanrite nimekiri
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const genres = await getAllGenres();
  res.json(genres);
}));

// POST /api/v1/genres — uue žanri lisamine
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const result = createGenreSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  // Kontrollime duplikaati andmebaasis enne lisamist
  if (await genreNameExists(result.data.name)) {
    res.status(409).json({ error: 'Sellise nimega žanr on juba olemas' });
    return;
  }

  const newGenre = await createGenre(result.data);
  res.status(201).json(newGenre);
}));

// GET /api/v1/genres/:id — ühe žanri andmed
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const genre = await getGenreById(id);
  if (!genre) {
    res.status(404).json({ error: 'Žanrit ei leitud' });
    return;
  }

  res.json(genre);
}));

// GET /api/v1/genres/:id/books — kõik raamatud selle žanriga
router.get('/:id/books', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const genre = await getGenreById(id);
  if (!genre) {
    res.status(404).json({ error: 'Žanrit ei leitud' });
    return;
  }

  const books = await getBooksByGenreId(id);
  res.json(books);
}));

export default router;

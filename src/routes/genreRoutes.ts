import { Router, Request, Response } from 'express';
import {
  getAllGenres,
  getGenreById,
  createGenre,
  genreNameExists,
} from '../services/genreService';
import { getAllBooks } from '../services/bookService';
import { createGenreSchema } from '../validators/genreValidator';

const router = Router();

// GET /api/v1/genres — kõikide žanrite nimekiri
router.get('/', (_req: Request, res: Response) => {
  const allGenres = getAllGenres();
  res.json(allGenres);
});

// POST /api/v1/genres — uue žanri lisamine
router.post('/', (req: Request, res: Response) => {
  const result = createGenreSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  // Kontrollime, et sama nimega žanr ei eksisteeriks juba
  if (genreNameExists(result.data.name)) {
    res.status(409).json({ error: 'Sellise nimega žanr on juba olemas' });
    return;
  }

  const newGenre = createGenre(result.data);
  res.status(201).json(newGenre);
});

// GET /api/v1/genres/:id — ühe žanri andmed
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const genre = getGenreById(id);

  if (!genre) {
    res.status(404).json({ error: 'Žanrit ei leitud' });
    return;
  }

  res.json(genre);
});

// GET /api/v1/genres/:id/books — kõik raamatud selle žanriga
router.get('/:id/books', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  // Kontrollime et žanr eksisteerib enne raamatute filtreerimist
  const genre = getGenreById(id);
  if (!genre) {
    res.status(404).json({ error: 'Žanrit ei leitud' });
    return;
  }

  // Raamat kuulub žanrisse kui žanri ID on raamatu genres massiivis
  const genreBooks = getAllBooks().filter((b) => b.genres.includes(id));
  res.json(genreBooks);
});

export default router;

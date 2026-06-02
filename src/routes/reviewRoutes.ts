import { Router, Request, Response } from 'express';
import { getReviewById, updateReview, deleteReview } from '../services/reviewService';
import { updateReviewSchema } from '../validators/reviewValidator';
import { asyncHandler } from '../utils/asyncHandler';

// Eraldiseisvad arvustuste marsruudid (ilma bookId-ta)
// POST ja GET /books/:id/reviews on defineeritud bookRoutes.ts failis
const router = Router();

// GET /api/v1/reviews/:id — ühe arvustuse andmed
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const review = await getReviewById(id);
  if (!review) {
    res.status(404).json({ error: 'Arvustust ei leitud' });
    return;
  }

  res.json(review);
}));

// PUT /api/v1/reviews/:id — arvustuse uuendamine
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const result = updateReviewSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ error: 'Vigased andmed', details });
    return;
  }

  const updated = await updateReview(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Arvustust ei leitud' });
    return;
  }

  res.json(updated);
}));

// DELETE /api/v1/reviews/:id — arvustuse kustutamine
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Vigane ID formaat' });
    return;
  }

  const deleted = await deleteReview(id);
  if (!deleted) {
    res.status(404).json({ error: 'Arvustust ei leitud' });
    return;
  }

  res.status(204).send();
}));

export default router;

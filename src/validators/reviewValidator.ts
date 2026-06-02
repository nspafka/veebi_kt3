import { z } from 'zod';

export const createReviewSchema = z.object({
  userName: z.string().min(1, 'Kasutajanimi on kohustuslik'),
  rating: z.number().int().min(1, 'Hinne peab olema vähemalt 1').max(5, 'Hinne ei tohi olla suurem kui 5'),
  comment: z.string().min(1, 'Kommentaar on kohustuslik'),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

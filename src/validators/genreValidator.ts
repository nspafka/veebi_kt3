import { z } from 'zod';

export const createGenreSchema = z.object({
  name: z.string().min(1, 'Žanri nimi on kohustuslik'),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;

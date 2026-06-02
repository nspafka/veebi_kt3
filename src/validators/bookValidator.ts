import { z } from 'zod';

const isbnRegex = /^(?:\d{9}[\dX]|\d{13})$/;

export const createBookSchema = z.object({
  title: z.string().min(1, 'Pealkiri on kohustuslik'),
  isbn: z.string().regex(isbnRegex, 'Vigane ISBN formaat'),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
  pageCount: z.number().int().min(1, 'Lehekülgede arv peab olema positiivne'),
  language: z.string().min(1, 'Keel on kohustuslik'),
  description: z.string().min(1, 'Kirjeldus on kohustuslik'),
  coverImage: z.string().url('Vigane kaanepildi aadress').optional(),
  authorId: z.number().int().positive('Autori ID peab olema positiivne'),
  publisherId: z.number().int().positive('Kirjastuse ID peab olema positiivne'),
  genres: z.array(z.number().int().positive()).min(1, 'Vähemalt üks žanr on kohustuslik'),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

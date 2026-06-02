import { z } from 'zod';

export const createAuthorSchema = z.object({
  firstName: z.string().min(1, 'Eesnimi on kohustuslik'),
  lastName: z.string().min(1, 'Perekonnanimi on kohustuslik'),
  birthYear: z.number().int().min(1000).max(new Date().getFullYear()),
  nationality: z.string().min(1, 'Rahvus on kohustuslik'),
  biography: z.string().optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;

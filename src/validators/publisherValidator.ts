import { z } from 'zod';

export const createPublisherSchema = z.object({
  name: z.string().min(1, 'Kirjastuse nimi on kohustuslik'),
  country: z.string().min(1, 'Riik on kohustuslik'),
  foundedYear: z.number().int().min(1000).max(new Date().getFullYear()),
  website: z.string().url('Vigane veebisaidi aadress').optional(),
});

export const updatePublisherSchema = createPublisherSchema.partial();

export type CreatePublisherInput = z.infer<typeof createPublisherSchema>;
export type UpdatePublisherInput = z.infer<typeof updatePublisherSchema>;

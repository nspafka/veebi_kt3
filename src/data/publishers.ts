import { Publisher } from '../models/Publisher';

// Kirjastuste andmed — 4 kirjastust Eestist ja välismaalt
export const publishers: Publisher[] = [
  {
    id: 1,
    name: 'Avita',
    country: 'Eesti',
    foundedYear: 1991,
    website: 'https://www.avita.ee',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Tänapäev',
    country: 'Eesti',
    foundedYear: 1999,
    website: 'https://www.tanapäev.ee',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Bloomsbury',
    country: 'Suurbritannia',
    foundedYear: 1986,
    website: 'https://www.bloomsbury.com',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Penguin Books',
    country: 'Suurbritannia',
    foundedYear: 1935,
    website: 'https://www.penguin.co.uk',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

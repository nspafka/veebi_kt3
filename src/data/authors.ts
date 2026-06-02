import { Author } from '../models/Author';

// Autorite andmed — 6 autorit erinevatest rahvustest
export const authors: Author[] = [
  {
    id: 1,
    firstName: 'Anton',
    lastName: 'Hansen Tammsaare',
    birthYear: 1878,
    nationality: 'eestlane',
    biography: 'Eesti kirjanduse suurkuju, tuntud eelkõige romaanitsükli "Tõde ja õigus" poolest.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    firstName: 'Jaan',
    lastName: 'Kross',
    birthYear: 1920,
    nationality: 'eestlane',
    biography: 'Eesti kirjanik ja poliitik, tuntud ajalooliste romaanide autor.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    firstName: 'Lydia',
    lastName: 'Koidula',
    birthYear: 1843,
    nationality: 'eestlane',
    biography: 'Eesti rahvuslik naiskirjanik ja luuletaja, "Eesti rahva lauliku" tiitli kandja.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    firstName: 'J.K.',
    lastName: 'Rowling',
    birthYear: 1965,
    nationality: 'britlane',
    biography: 'Briti kirjanik, tuntud Harry Potteri raamatusarja autor.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    firstName: 'George',
    lastName: 'Orwell',
    birthYear: 1903,
    nationality: 'britlane',
    biography: 'Briti kirjanik ja ajakirjanik, tuntud teoste "1984" ja "Loomafarm" autor.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 6,
    firstName: 'Gabriel',
    lastName: 'García Márquez',
    birthYear: 1927,
    nationality: 'kolumblane',
    biography: 'Kolumbia kirjanik ja Nobeli kirjanduspreemia laureaat, maagilise realismi pioneer.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

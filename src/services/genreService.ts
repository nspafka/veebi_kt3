import { Genre } from '../models/Genre';
import { genres } from '../data';
import { CreateGenreInput } from '../validators/genreValidator';

// Järgmise ID arvutamiseks
let nextId = Math.max(...genres.map((g) => g.id)) + 1;

// Kõikide žanrite tagastamine
export function getAllGenres(): Genre[] {
  return genres;
}

// Ühe žanri otsimine ID järgi
export function getGenreById(id: number): Genre | undefined {
  return genres.find((g) => g.id === id);
}

// Kontrollib, kas sama nimega žanr on juba olemas — kasutatakse duplikaadi kontrollimiseks marsruudis
export function genreNameExists(name: string): boolean {
  return genres.some((g) => g.name.toLowerCase() === name.toLowerCase());
}

// Uue žanri lisamine
export function createGenre(input: CreateGenreInput): Genre {
  const newGenre: Genre = {
    id: nextId++,
    name: input.name,
  };
  genres.push(newGenre);
  return newGenre;
}

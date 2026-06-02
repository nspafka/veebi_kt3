import { Author } from '../models/Author';
import { authors } from '../data';
import { CreateAuthorInput, UpdateAuthorInput } from '../validators/authorValidator';

// Järgmise ID arvutamiseks
let nextId = Math.max(...authors.map((a) => a.id)) + 1;

// Kõikide autorite tagastamine
export function getAllAuthors(): Author[] {
  return authors;
}

// Ühe autori otsimine ID järgi
export function getAuthorById(id: number): Author | undefined {
  return authors.find((a) => a.id === id);
}

// Uue autori lisamine
export function createAuthor(input: CreateAuthorInput): Author {
  const newAuthor: Author = {
    id: nextId++,
    ...input,
    createdAt: new Date().toISOString(),
  };
  authors.push(newAuthor);
  return newAuthor;
}

// Olemasoleva autori uuendamine — uuendab ainult saadetud väljad
export function updateAuthor(id: number, input: UpdateAuthorInput): Author | undefined {
  const index = authors.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  const updated: Author = { ...authors[index], ...input };
  authors[index] = updated;
  return updated;
}

// Autori kustutamine ID järgi
export function deleteAuthor(id: number): boolean {
  const index = authors.findIndex((a) => a.id === id);
  if (index === -1) return false;

  authors.splice(index, 1);
  return true;
}

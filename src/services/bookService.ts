import { Book } from '../models/Book';
import { books } from '../data';
import { CreateBookInput, UpdateBookInput } from '../validators/bookValidator';

// Järgmise ID arvutamiseks — leiame suurima olemasoleva ID ja lisame 1
let nextId = Math.max(...books.map((b) => b.id)) + 1;

// Kõikide raamatute tagastamine
export function getAllBooks(): Book[] {
  return books;
}

// Ühe raamatu otsimine ID järgi — tagastab undefined kui ei leita
export function getBookById(id: number): Book | undefined {
  return books.find((b) => b.id === id);
}

// Uue raamatu lisamine — genereerib automaatselt ID, createdAt ja updatedAt
export function createBook(input: CreateBookInput): Book {
  const now = new Date().toISOString();
  const newBook: Book = {
    id: nextId++,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  books.push(newBook);
  return newBook;
}

// Olemasoleva raamatu uuendamine — uuendab ainult saadetud väljad
export function updateBook(id: number, input: UpdateBookInput): Book | undefined {
  // Leiame raamatu indeksi massiivis
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return undefined;

  // Uuendame raamatut ja seame updatedAt praegusele ajale
  const updated: Book = {
    ...books[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  books[index] = updated;
  return updated;
}

// Raamatu kustutamine ID järgi — tagastab true kui kustutati, false kui ei leitud
export function deleteBook(id: number): boolean {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return false;

  books.splice(index, 1);
  return true;
}

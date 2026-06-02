import { Book } from '../models/Book';
import { books } from '../data';
import { authors, publishers } from '../data';
import { CreateBookInput, UpdateBookInput } from '../validators/bookValidator';

// Järgmise ID arvutamiseks — leiame suurima olemasoleva ID ja lisame 1
let nextId = Math.max(...books.map((b) => b.id)) + 1;

// Filtreerimise ja sorteerimise parameetrite tüüp
export interface BookQueryParams {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  year?: string;
  publisher?: string;
  sortBy?: string;
  order?: string;
}

// Kõikide raamatute tagastamine koos filtreerimise ja sorteerimisega
export function getAllBooks(params: BookQueryParams = {}): Book[] {
  let result = [...books];

  // Filtreerimine pealkirja järgi — otsib osalist vastet (sõltumata suur/väiketähtedest)
  if (params.title) {
    const titleLower = params.title.toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(titleLower));
  }

  // Filtreerimine autori nime järgi — otsib eesnime ja perekonnanime kombinatsiooni
  if (params.author) {
    const authorLower = params.author.toLowerCase();
    result = result.filter((b) => {
      const author = authors.find((a) => a.id === b.authorId);
      if (!author) return false;
      const fullName = `${author.firstName} ${author.lastName}`.toLowerCase();
      return fullName.includes(authorLower);
    });
  }

  // Filtreerimine žanri nime järgi — otsib raamatu genres massiivi kaudu
  if (params.genre) {
    const genreLower = params.genre.toLowerCase();
    // Impordime žanrid otse andmefailist et vältida tsüklilist sõltuvust
    const { genres } = require('../data');
    result = result.filter((b) => {
      return b.genres.some((genreId: number) => {
        const genre = genres.find((g: { id: number; name: string }) => g.id === genreId);
        return genre?.name.toLowerCase().includes(genreLower);
      });
    });
  }

  // Filtreerimine keele järgi — täpne vaste (sõltumata suur/väiketähtedest)
  if (params.language) {
    const langLower = params.language.toLowerCase();
    result = result.filter((b) => b.language.toLowerCase() === langLower);
  }

  // Filtreerimine avaldamisaasta järgi — täpne aasta
  if (params.year) {
    const year = parseInt(params.year);
    if (!isNaN(year)) {
      result = result.filter((b) => b.publishedYear === year);
    }
  }

  // Filtreerimine kirjastuse nime järgi — otsib osalist vastet
  if (params.publisher) {
    const publisherLower = params.publisher.toLowerCase();
    result = result.filter((b) => {
      const publisher = publishers.find((p) => p.id === b.publisherId);
      return publisher?.name.toLowerCase().includes(publisherLower);
    });
  }

  // Sorteerimine — toetab pealkirja ja avaldamisaasta järgi sorteerimist
  if (params.sortBy === 'title') {
    result.sort((a, b) => {
      // Väiketähtedesse teisendamine et sorteerimine oleks ühtne
      const comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      return params.order === 'desc' ? -comparison : comparison;
    });
  } else if (params.sortBy === 'publishedYear') {
    result.sort((a, b) => {
      const comparison = a.publishedYear - b.publishedYear;
      return params.order === 'desc' ? -comparison : comparison;
    });
  }

  return result;
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

import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

// Teisendab tuntud Prisma vead AppError klassi instantsideks
// Tundmatud vead visatakse edasi et errorHandler saaks neid 500-na käsitleda
export function handlePrismaError(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      // P2025 — kirjet ei leitud (update/delete puhul)
      case 'P2025':
        throw new AppError('Kirjet ei leitud', 404);
      // P2002 — unikaalse välja duplikaat (nt ISBN, žanri nimi)
      case 'P2002':
        throw new AppError('Selline kirje on juba olemas', 409);
      // P2003 — välisviite piirang (nt autori kustutamine kui tal on raamatud)
      case 'P2003':
        throw new AppError('Kirjet ei saa kustutada — sellel on seotud andmeid', 409);
    }
  }
  // Tundmatu viga — edastame edasi et errorHandler käsitleks 500-na
  throw e;
}

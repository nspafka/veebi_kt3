import { PrismaClient } from '@prisma/client';

// Singleton — üks Prisma klient kogu rakenduse jaoks
// Mitu instantsi tekitaks liiga palju ühendusi andmebaasiga
const prisma = new PrismaClient();

export default prisma;

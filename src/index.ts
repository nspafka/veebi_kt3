import app from './app';

const PORT = process.env.PORT ?? 3000;
const USE_DB = !!process.env.DATABASE_URL;

const server = app.listen(PORT, () => {
  if (USE_DB) {
    console.log(`Server töötab pordil ${PORT} — andmebaas: PostgreSQL (Prisma)`);
  } else {
    console.log(`Server töötab pordil ${PORT} — andmebaas: mock andmed (in-memory)`);
  }
});

// Suleme Prisma ühenduse ainult siis kui andmebaas on kasutusel
async function shutdown(): Promise<void> {
  console.log('Server peatub...');
  server.close();
  if (USE_DB) {
    const prisma = (await import('./lib/prisma')).default;
    await prisma.$disconnect();
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

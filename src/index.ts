import app from './app';
import prisma from './lib/prisma';

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
});

// Suleme Prisma ühenduse kui server peatub
async function shutdown(): Promise<void> {
  console.log('Server peatub...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

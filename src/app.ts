import express from 'express';
import bookRoutes from './routes/bookRoutes';

const app = express();

// JSON päringu keha lugemine
app.use(express.json());

// Raamatute marsruudid
app.use('/api/v1/books', bookRoutes);

// Serveri elutähise kontroll
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

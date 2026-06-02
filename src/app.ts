import express from 'express';
import bookRoutes from './routes/bookRoutes';
import authorRoutes from './routes/authorRoutes';
import publisherRoutes from './routes/publisherRoutes';

const app = express();

// JSON päringu keha lugemine
app.use(express.json());

// Marsruudid
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/publishers', publisherRoutes);

// Serveri elutähise kontroll
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

import express from 'express';
import bookRoutes from './routes/bookRoutes';
import authorRoutes from './routes/authorRoutes';
import publisherRoutes from './routes/publisherRoutes';
import reviewRoutes from './routes/reviewRoutes';
import genreRoutes from './routes/genreRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// JSON päringu keha lugemine
app.use(express.json());

// Marsruudid
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/publishers', publisherRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/genres', genreRoutes);

// Serveri elutähise kontroll
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 404 — peab olema pärast kõiki marsruute
app.use(notFoundHandler);

// Üldine veatöötleja — peab olema viimane middleware
app.use(errorHandler);

export default app;

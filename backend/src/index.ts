import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import adminRoutes from './routes/admin.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { ensureDefaultAdminAndSeed } from './utils/seed';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
  await ensureDefaultAdminAndSeed();
});


import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { authRouter } from './routes/auth';
import { documentRouter } from './routes/documents';
import { aiRouter } from './routes/ai';
import { flashcardsRouter } from './routes/flashcards';
import { quizzesRouter } from './routes/quizzes';
import { dashboardRouter } from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/documents', documentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-learning';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!process.env.MONGO_URI || MONGO_URI.includes('localhost'))) {
  console.error(
    'In production, set MONGO_URI to your MongoDB Atlas (or other hosted DB) connection string in the Render Environment tab.'
  );
  process.exit(1);
}

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});


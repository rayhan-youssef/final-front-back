import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { StudyDocumentModel } from '../models/Document';
import { FlashcardModel, QuizModel } from '../models/StudyAI';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [totalDocuments, totalFlashcards, totalQuizzes, recentDocs, recentQuizzes, favoriteCards] =
    await Promise.all([
      StudyDocumentModel.countDocuments({ owner: userId }),
      FlashcardModel.countDocuments({ owner: userId }),
      QuizModel.countDocuments({ owner: userId }),
      StudyDocumentModel.find({ owner: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      QuizModel.find({ owner: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      FlashcardModel.find({ owner: userId, isFavorite: true })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const recentActivity = [
    ...recentDocs.map((d) => ({
      type: 'document' as const,
      id: d._id,
      title: d.title,
      createdAt: d.createdAt,
    })),
    ...recentQuizzes.map((q) => ({
      type: 'quiz' as const,
      id: q._id,
      createdAt: q.createdAt,
    })),
  ]
    .sort(
      (a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime(),
    )
    .slice(0, 8);

  res.json({
    totals: {
      documents: totalDocuments,
      flashcards: totalFlashcards,
      quizzes: totalQuizzes,
      favorites: favoriteCards.length,
    },
    recentActivity,
  });
});


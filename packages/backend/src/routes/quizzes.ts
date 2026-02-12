import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { QuizModel } from '../models/StudyAI';

export const quizzesRouter = Router();

// Get latest quiz for a document
quizzesRouter.get(
  '/latest/:documentId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { documentId } = req.params;

    const quiz = await QuizModel.findOne({
      owner: req.user!.id,
      document: documentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!quiz) {
      res.status(404).json({ message: 'No quiz found for this document' });
      return;
    }

    res.json(quiz);
  },
);

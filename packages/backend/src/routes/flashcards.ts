import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { FlashcardModel } from '../models/StudyAI';

export const flashcardsRouter = Router();

// List flashcards for a given document
flashcardsRouter.get(
  '/:documentId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
  const { documentId } = req.params;

  const cards = await FlashcardModel.find({
    owner: req.user!.id,
    document: documentId,
  })
    .sort({ createdAt: -1 })
    .lean();

    res.json(cards);
  },
);

// Toggle / set favorite state for a single flashcard
flashcardsRouter.patch(
  '/:id/favorite',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isFavorite } = req.body as { isFavorite?: boolean };

  const card = await FlashcardModel.findOne({
    _id: id,
    owner: req.user!.id,
  });

    if (!card) {
      res.status(404).json({ message: 'Flashcard not found' });
      return;
    }

    card.isFavorite = typeof isFavorite === 'boolean' ? isFavorite : !card.isFavorite;
    await card.save();

    res.json(card);
  },
);


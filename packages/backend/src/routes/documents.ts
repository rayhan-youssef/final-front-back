import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { StudyDocumentModel } from '../models/Document';
import { FlashcardModel, QuizModel } from '../models/StudyAI';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const documentRouter = Router();

// List documents for current user
documentRouter.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const docs = await StudyDocumentModel.find({ owner: req.user!.id }).sort({ createdAt: -1 });
  res.json(docs);
});

// Upload a new PDF
documentRouter.post(
  '/upload',
  requireAuth,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);

    const doc = await StudyDocumentModel.create({
      owner: req.user!.id,
      title: req.body.title || req.file.originalname,
      originalFileName: req.file.originalname,
      storagePath: req.file.path,
      textContent: pdfData.text,
    });

    res.status(201).json(doc);
  },
);

// Get single document metadata
documentRouter.get(
  '/:id',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
  const doc = await StudyDocumentModel.findOne({
    _id: req.params.id,
    owner: req.user!.id,
  });
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }
    res.json(doc);
  },
);

// Delete a document and its related data
documentRouter.delete(
  '/:id',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const doc = await StudyDocumentModel.findOne({
      _id: req.params.id,
      owner: req.user!.id,
    });

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    // Best-effort: remove PDF file from disk
    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      try {
        fs.unlinkSync(doc.storagePath);
      } catch {
        // Ignore file delete errors; DB delete is still valid
      }
    }

    // Delete related flashcards and quizzes
    await Promise.all([
      FlashcardModel.deleteMany({ owner: req.user!.id, document: doc._id }),
      QuizModel.deleteMany({ owner: req.user!.id, document: doc._id }),
      doc.deleteOne(),
    ]);

    res.status(204).send();
  },
);


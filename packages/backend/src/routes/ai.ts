import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { StudyDocumentModel } from '../models/Document';
import { FlashcardModel, QuizModel, IQuizQuestion } from '../models/StudyAI';
import { generateGeminiText } from '../services/geminiClient';

export const aiRouter = Router();

// Try to recover a JSON array from model output that may contain extra text
function extractJsonArray(text: string): string {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

async function getUserDocumentText(userId: string, docId: string) {
  const doc = await StudyDocumentModel.findOne({ _id: docId, owner: userId });
  if (!doc) {
    throw Object.assign(new Error('Document not found'), { status: 404 });
  }
  if (!doc.textContent) {
    throw Object.assign(new Error('Document text not available'), { status: 400 });
  }
  return { doc, text: doc.textContent };
}

// AI chat about a document
aiRouter.post('/chat', requireAuth, async (req: AuthRequest, res) => {
  const { documentId, message } = req.body;
  const { text } = await getUserDocumentText(req.user!.id, documentId);

  const systemPrompt =
    'You are a helpful study assistant. Answer questions using ONLY the document text provided.';
  const userPrompt = `Document text:\n${text}\n\nUser question: ${message}`;

  const answer = await generateGeminiText(systemPrompt, userPrompt);
  res.json({ answer });
});

// AI summary of entire document
aiRouter.post('/summary', requireAuth, async (req: AuthRequest, res) => {
  const { documentId } = req.body;
  const { text } = await getUserDocumentText(req.user!.id, documentId);

  const systemPrompt =
    'Summarize the following document into a concise, student-friendly study summary with headings and bullet points.';
  const userPrompt = `Document text:\n${text}`;

  const summary = await generateGeminiText(systemPrompt, userPrompt);
  res.json({ summary });
});

// AI concept explainer
aiRouter.post('/explain', requireAuth, async (req: AuthRequest, res) => {
  const { documentId, concept } = req.body;
  const { text } = await getUserDocumentText(req.user!.id, documentId);

  const systemPrompt =
    'Explain the requested concept in a clear, step-by-step way suitable for a student, referencing only the provided document.';
  const userPrompt = `Document text:\n${text}\n\nConcept to explain: ${concept}`;

  const explanation = await generateGeminiText(systemPrompt, userPrompt);
  res.json({ explanation });
});

// Auto-generate flashcards
aiRouter.post('/flashcards', requireAuth, async (req: AuthRequest, res) => {
  const { documentId } = req.body;
  const { doc, text } = await getUserDocumentText(req.user!.id, documentId);

  const systemPrompt =
    'You are a JSON API. Extract key concepts from the document and return EXACTLY 15 Q/A flashcards as a JSON array ONLY, no markdown, no prose, no explanations. The JSON format must be: [{ "front": "question", "back": "answer" }]. Do NOT include any other keys, and do NOT include any text before or after the JSON.';
  const userPrompt = `Document text:\n${text}`;

  const jsonText = extractJsonArray(await generateGeminiText(systemPrompt, userPrompt));

  let parsed: Array<{ front: string; back: string }>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw Object.assign(new Error('Failed to parse flashcards from AI'), { status: 500 });
  }

  const created = await FlashcardModel.insertMany(
    parsed.map((fc) => ({
      owner: req.user!.id,
      document: doc.id,
      front: fc.front,
      back: fc.back,
    })),
  );

  res.status(201).json(created);
});

// Generate quiz
aiRouter.post('/quiz', requireAuth, async (req: AuthRequest, res) => {
  const { documentId, questionCount = 10 } = req.body;
  const { doc, text } = await getUserDocumentText(req.user!.id, documentId);

  const systemPrompt =
    'You are a JSON API. Generate a multiple-choice quiz and return JSON ONLY, as an array of objects: { "question": string, "options": string[4], "correctIndex": number, "explanation": string }. Do NOT include any keys other than these, and do NOT include any text before or after the JSON array.';
  const userPrompt = `Question count: ${questionCount}\nDocument text:\n${text}`;

  const jsonText = extractJsonArray(await generateGeminiText(systemPrompt, userPrompt));

  let parsed: IQuizQuestion[];
  try {
    parsed = JSON.parse(jsonText) as IQuizQuestion[];
  } catch {
    throw Object.assign(new Error('Failed to parse quiz from AI'), { status: 500 });
  }

  const quiz = await QuizModel.create({
    owner: req.user!.id,
    document: doc.id,
    questions: parsed,
  });

  res.status(201).json(quiz);
});


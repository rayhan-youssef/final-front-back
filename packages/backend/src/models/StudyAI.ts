import mongoose, { Schema, Document as MDocument } from 'mongoose';

export interface IFlashcard extends MDocument {
  owner: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId;
  front: string;
  back: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    document: { type: Schema.Types.ObjectId, ref: 'StudyDocument', required: true, index: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const FlashcardModel = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IQuiz extends MDocument {
  owner: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String },
  },
  { _id: false },
);

const quizSchema = new Schema<IQuiz>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    document: { type: Schema.Types.ObjectId, ref: 'StudyDocument', required: true, index: true },
    questions: [quizQuestionSchema],
  },
  { timestamps: true },
);

export const QuizModel = mongoose.model<IQuiz>('Quiz', quizSchema);


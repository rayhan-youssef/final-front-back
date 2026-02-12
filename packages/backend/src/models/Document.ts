import mongoose, { Schema, Document as MDocument } from 'mongoose';

export interface IStudyDocument extends MDocument {
  owner: mongoose.Types.ObjectId;
  title: string;
  originalFileName: string;
  storagePath: string;
  textContent?: string;
  createdAt: Date;
}

const studyDocumentSchema = new Schema<IStudyDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    originalFileName: { type: String, required: true },
    storagePath: { type: String, required: true },
    textContent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const StudyDocumentModel = mongoose.model<IStudyDocument>('StudyDocument', studyDocumentSchema);


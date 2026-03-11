export interface Document {
  documentId: string;
  fileName: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  totalChunks: number;
  subject: string;
  chapter: string;
  uploadedBy?: string;
  uploadDate?: string;
}

export interface UploadResponse {
  documentId: string;
  fileName: string;
  status: string;
  message: string;
}

export interface DocumentStatus {
  documentId: string;
  fileName: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  totalChunks: number;
  subject: string;
  chapter: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  relevantChunks: string[];
  subject: string;
  chapter: string;
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id?: string;
  questionText: string;
  type: 'MCQ' | 'SHORT_ANSWER' | 'DESCRIPTIVE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options?: QuestionOption[];
  correctAnswer: string;
  subject: string;
  chapter: string;
  repeatCount?: number;
}

export interface GenerateResponse {
  subject: string;
  chapter: string;
  totalGenerated: number;
  questions: Question[];
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
export type QuestionType = 'MCQ' | 'SHORT_ANSWER' | 'DESCRIPTIVE' | 'MIXED';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

import api from './axiosInstance';
import type { GenerateResponse, Question, Difficulty, QuestionType } from '@/types';

export const generateQuestions = async (
  subject: string,
  chapter: string,
  numberOfQuestions: number,
  difficulty: Difficulty,
  type: QuestionType
): Promise<GenerateResponse> => {
  const { data } = await api.post('/generate', {
    subject,
    chapter,
    numberOfQuestions,
    difficulty,
    type,
  });
  return data;
};

export const getQuestions = async (
  subject?: string,
  chapter?: string,
  difficulty?: string,
  type?: string
): Promise<Question[]> => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (chapter) params.append('chapter', chapter);
  if (difficulty) params.append('difficulty', difficulty);
  if (type) params.append('type', type);
  const { data } = await api.get(`/generate/questions?${params.toString()}`);
  return data;
};

export const getPopularQuestions = async (subject: string, chapter: string): Promise<Question[]> => {
  const { data } = await api.get(`/generate/popular?subject=${subject}&chapter=${chapter}`);
  return data;
};

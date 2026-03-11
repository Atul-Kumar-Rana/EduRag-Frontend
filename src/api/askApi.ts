import api from './axiosInstance';
import type { AskResponse } from '@/types';

export const askQuestion = async (
  question: string,
  subject: string,
  chapter: string
): Promise<AskResponse> => {
  const { data } = await api.post('/ask', { question, subject, chapter });
  return data;
};

export const solveDoubt = async (
  question: string,
  subject?: string,
  chapter?: string
): Promise<AskResponse> => {
  const { data } = await api.post('/ask/doubt', { question, subject, chapter });
  return data;
};

import type { Document, DocumentStatus, Question, UploadResponse } from '@/types';
import api from './axiosInstance';

export const uploadDocument = async (
  file: File,
  subject: string,
  chapter: string,
  uploadedBy: string = 'admin'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  formData.append('chapter', chapter);
  formData.append('uploadedBy', uploadedBy);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const uploadDocumentAndGenerateQuestions = async (
  file: File,
  subject: string,
  chapter: string,
  uploadedBy: string = 'admin'
): Promise<{ uploadResponse: UploadResponse; generatedQuestions: Question[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  formData.append('chapter', chapter);
  formData.append('uploadedBy', uploadedBy);

  const { data: uploadResponse } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const { data: generatedQuestions } = await api.post('/generate', {
    subject,
    chapter,
    numQuestions: 10, // Default number of questions to generate
    difficulty: 'MIXED',
    type: 'MIXED',
  });

  return { uploadResponse, generatedQuestions };
};

export const getDocumentStatus = async (documentId: string): Promise<DocumentStatus> => {
  const { data } = await api.get(`/upload/status/${documentId}`);
  return data;
};

export const getAllDocuments = async (subject?: string, chapter?: string): Promise<Document[]> => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (chapter) params.append('chapter', chapter);
  const { data } = await api.get(`/upload/documents?${params.toString()}`);
  return data;
};

export const deleteDocument = async (documentId: string): Promise<{ message: string; documentId: string }> => {
  const { data } = await api.delete(`/upload/documents/${documentId}`);
  return data;
};

export const fetchUploadedPDFs = async (): Promise<string[]> => {
  const { data } = await api.get('/upload/documents');
  return data.map((doc: { name: string }) => doc.name);
};

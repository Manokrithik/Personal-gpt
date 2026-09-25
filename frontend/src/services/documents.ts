import { request } from './api';
import { DocumentItem } from '../types';

export const documentService = {
  listDocuments: () => request<DocumentItem[]>('/documents'),

  getDocument: (id: string) => request<DocumentItem>(`/documents/${id}`),

  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  deleteDocument: (id: string) =>
    request<void>(`/documents/${id}`, {
      method: 'DELETE',
    }),

  search: (query: string, top_k: number = 4) =>
    request<any[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query, top_k }),
    }),
};

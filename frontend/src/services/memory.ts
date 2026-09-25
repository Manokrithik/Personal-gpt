import { request } from './api';
import { MemoryItem } from '../types';

export const memoryService = {
  listMemories: () => request<MemoryItem[]>('/memory'),

  createMemory: (content: string, memory_type: string = 'fact', importance: number = 0.5) =>
    request<MemoryItem>('/memory', {
      method: 'POST',
      body: JSON.stringify({ content, memory_type, importance }),
    }),

  deleteMemory: (id: string) =>
    request<void>(`/memory/${id}`, {
      method: 'DELETE',
    }),

  clearAll: () =>
    request<{ message: string }>('/memory', {
      method: 'DELETE',
    }),
};

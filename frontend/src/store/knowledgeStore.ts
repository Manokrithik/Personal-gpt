import { create } from 'zustand';
import { DocumentItem } from '../types';
import { documentService } from '../services/documents';

interface KnowledgeState {
  documents: DocumentItem[];
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;

  fetchDocuments: () => Promise<void>;
  uploadFile: (file: File) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  documents: [],
  isLoading: false,
  isUploading: false,
  uploadError: null,

  fetchDocuments: async () => {
    set({ isLoading: true });
    try {
      const docs = await documentService.listDocuments();
      set({ documents: docs, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch documents', e);
      set({ isLoading: false });
    }
  },

  uploadFile: async (file: File) => {
    set({ isUploading: true, uploadError: null });
    try {
      const doc = await documentService.uploadDocument(file);
      set((state) => ({
        documents: [doc, ...state.documents],
        isUploading: false,
      }));
      return true;
    } catch (err: any) {
      console.error('Failed to upload document', err);
      set({ uploadError: err.message || 'Upload failed', isUploading: false });
      return false;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete document', e);
    }
  },
}));

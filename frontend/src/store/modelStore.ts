import { create } from 'zustand';
import { ModelItem } from '../types';
import { modelService } from '../services/models';

interface ModelState {
  models: ModelItem[];
  currentModel: string;
  currentProvider: string;
  isLoading: boolean;

  fetchModels: () => Promise<void>;
  selectModel: (model: string, provider?: string) => Promise<void>;
}

export const useModelStore = create<ModelState>((set) => ({
  models: [],
  currentModel: 'gemini-1.5-flash',
  currentProvider: 'gemini',
  isLoading: false,

  fetchModels: async () => {
    set({ isLoading: true });
    try {
      const data = await modelService.listModels();
      set({
        models: data.models,
        currentModel: data.current_model,
        currentProvider: data.current_provider,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to fetch models', e);
      set({ isLoading: false });
    }
  },

  selectModel: async (model: string, provider?: string) => {
    try {
      const selected = await modelService.selectModel(model, provider);
      set((state) => ({
        currentModel: selected.id,
        currentProvider: selected.provider,
        models: state.models.map((m) => ({
          ...m,
          is_selected: m.id === selected.id,
        })),
      }));
    } catch (e) {
      console.error('Failed to select model', e);
    }
  },
}));

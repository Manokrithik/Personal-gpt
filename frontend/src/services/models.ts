import { request } from './api';
import { ModelItem } from '../types';

export const modelService = {
  listModels: () => request<{ models: ModelItem[]; current_model: string; current_provider: string }>('/models'),

  selectModel: (model: string, provider?: string) =>
    request<ModelItem>('/models/select', {
      method: 'POST',
      body: JSON.stringify({ model, provider }),
    }),
};

import { request } from './api';
import { AppSettings, SystemHealth } from '../types';

export const settingsService = {
  getSettings: () => request<AppSettings>('/settings'),

  updateSettings: (updates: Partial<AppSettings>) =>
    request<AppSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  checkHealth: () => request<SystemHealth>('/health'),
};

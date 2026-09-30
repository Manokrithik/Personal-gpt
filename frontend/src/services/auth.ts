import { request } from './api';
import { User, AuthTokenResponse } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<AuthTokenResponse> {
    const data = await request<AuthTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.access_token) {
      localStorage.setItem('personalgpt_token', data.access_token);
    }
    return data;
  },

  async register(
    username: string,
    password: string,
    email?: string,
    displayName?: string,
    avatarColor?: string
  ): Promise<AuthTokenResponse> {
    const data = await request<AuthTokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email: email || undefined,
        display_name: displayName || undefined,
        avatar_color: avatarColor || undefined,
      }),
    });
    if (data.access_token) {
      localStorage.setItem('personalgpt_token', data.access_token);
    }
    return data;
  },

  async resetPassword(username: string, newPassword: string): Promise<AuthTokenResponse> {
    const data = await request<AuthTokenResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username, new_password: newPassword }),
    });
    if (data.access_token) {
      localStorage.setItem('personalgpt_token', data.access_token);
    }
    return data;
  },

  async getMe(): Promise<User> {
    return await request<User>('/auth/me');
  },

  async updateProfile(profileData: {
    display_name?: string;
    email?: string;
    avatar_color?: string;
  }): Promise<User> {
    return await request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('personalgpt_token');
    }
  },
};

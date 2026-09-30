import { request } from './api';
import { Conversation, Message, Citation } from '../types';

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onMetadata?: (meta: { conversation_id: string; message_id: string; citations?: Citation[]; tool_calls?: any[] }) => void;
  onError?: (err: Error) => void;
  onDone?: () => void;
}

export const chatService = {
  listConversations: () => request<Conversation[]>('/conversations'),
  
  getConversation: (id: string) => request<Conversation>(`/conversations/${id}`),

  createConversation: (title?: string, model?: string) => 
    request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Conversation', model }),
    }),

  updateConversation: (id: string, updates: { title?: string; is_pinned?: boolean }) =>
    request<Conversation>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteConversation: (id: string) =>
    request<void>(`/conversations/${id}`, {
      method: 'DELETE',
    }),

  getMessages: (conversationId: string) =>
    request<Message[]>(`/conversations/${conversationId}/messages`),

  streamChat: async (
    payload: {
      conversation_id?: string;
      message: string;
      image_data?: string;
      image_mime_type?: string;
      model?: string;
      provider?: string;
      use_rag?: boolean;
      use_memory?: boolean;
      use_tools?: boolean;
      temperature?: number;
    },

    callbacks: ChatStreamCallbacks,
    abortSignal?: AbortSignal
  ) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('personalgpt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortSignal,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported on this browser.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          
          try {
            const parsed = JSON.parse(trimmed.substring(6));
            if (parsed.delta) {
              callbacks.onToken(parsed.delta);
            }
            if (parsed.done) {
              if (callbacks.onMetadata) {
                callbacks.onMetadata(parsed);
              }
            }
          } catch (e) {
            console.error('Failed to parse SSE line', e);
          }
        }
      }

      callbacks.onDone?.();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onDone?.();
        return;
      }
      callbacks.onError?.(err);
    }
  },
};

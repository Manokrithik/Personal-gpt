import { create } from 'zustand';
import { Conversation, Message, Citation } from '../types';
import { chatService } from '../services/chat';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  abortController: AbortController | null;
  isCameraModalOpen: boolean;
  isMobileSidebarOpen: boolean;

  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  newChat: (model?: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  togglePinConversation: (id: string, is_pinned: boolean) => Promise<void>;
  setCameraModalOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  clearGuestHistory: () => void;
  sendMessage: (
    text: string,
    options?: {
      model?: string;
      provider?: string;
      use_rag?: boolean;
      use_memory?: boolean;
      use_tools?: boolean;
      image_data?: string;
      image_mime_type?: string;
    }
  ) => Promise<void>;
  stopGeneration: () => void;
}


export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingMessageId: null,
  abortController: null,
  isCameraModalOpen: false,
  isMobileSidebarOpen: false,

  setCameraModalOpen: (open: boolean) => set({ isCameraModalOpen: open }),
  setMobileSidebarOpen: (open: boolean) => set({ isMobileSidebarOpen: open }),

  clearGuestHistory: () => {
    set({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
      abortController: null,
    });
  },

  fetchConversations: async () => {
    const token = localStorage.getItem('personalgpt_token');
    if (!token) {
      // Guest mode (unauthenticated): all chat history clears on page reload
      set({ conversations: [], activeConversationId: null, messages: [] });
      return;
    }

    try {
      const convs = await chatService.listConversations();
      set({ conversations: convs });
      if (convs.length > 0) {
        const currentId = get().activeConversationId;
        const exists = convs.some((c) => c.id === currentId);
        if (!exists) {
          await get().selectConversation(convs[0].id);
        }
      } else {
        set({ activeConversationId: null, messages: [] });
      }
    } catch (e) {
      console.error('Failed to fetch user conversations', e);
      set({ conversations: [], activeConversationId: null, messages: [] });
    }
  },

  selectConversation: async (id: string) => {
    set({ activeConversationId: id, isLoading: true, isMobileSidebarOpen: false });
    try {
      const conv = await chatService.getConversation(id);
      set({ messages: conv.messages || [], isLoading: false });
    } catch (e) {
      console.error('Failed to load conversation messages', e);
      set({ isLoading: false });
    }
  },

  newChat: async (model?: string) => {
    try {
      const conv = await chatService.createConversation('New Chat', model);
      set((state) => ({
        conversations: [conv, ...state.conversations],
        activeConversationId: conv.id,
        messages: [],
        isMobileSidebarOpen: false,
      }));
      return conv.id;
    } catch (e) {
      console.error('Failed to create new conversation', e);
      return '';
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      set((state) => {
        const remaining = state.conversations.filter((c) => c.id !== id);
        const nextActive = state.activeConversationId === id ? (remaining[0]?.id || null) : state.activeConversationId;
        return {
          conversations: remaining,
          activeConversationId: nextActive,
          messages: state.activeConversationId === id ? [] : state.messages,
        };
      });
      if (get().activeConversationId) {
        await get().selectConversation(get().activeConversationId!);
      }
    } catch (e) {
      console.error('Failed to delete conversation', e);
    }
  },

  updateConversationTitle: async (id: string, title: string) => {
    try {
      const updated = await chatService.updateConversation(id, { title });
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, title: updated.title } : c)),
      }));
    } catch (e) {
      console.error('Failed to rename conversation', e);
    }
  },

  togglePinConversation: async (id: string, is_pinned: boolean) => {
    try {
      const updated = await chatService.updateConversation(id, { is_pinned });
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, is_pinned: updated.is_pinned } : c)),
      }));
    } catch (e) {
      console.error('Failed to pin conversation', e);
    }
  },

  sendMessage: async (text: string, options = {}) => {
    const { activeConversationId, newChat } = get();
    let convId = activeConversationId;
    if (!convId) {
      convId = await newChat(options.model);
    }

    const tempUserMsg: Message = {
      id: `usr_${Date.now()}`,
      conversation_id: convId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      extra_metadata: options.image_data ? { image_data: options.image_data, image_mime_type: options.image_mime_type } : undefined,
    };

    const tempAssistantMsg: Message = {
      id: `asst_${Date.now()}`,
      conversation_id: convId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg, tempAssistantMsg],
      isStreaming: true,
      streamingMessageId: tempAssistantMsg.id,
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    await chatService.streamChat(
      {
        conversation_id: convId,
        message: text,
        model: options.model,
        provider: options.provider,
        use_rag: options.use_rag ?? true,
        use_memory: options.use_memory ?? true,
        use_tools: options.use_tools ?? true,
        image_data: options.image_data,
        image_mime_type: options.image_mime_type,
      },
      {
        onToken: (token) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempAssistantMsg.id ? { ...m, content: m.content + token } : m
            ),
          }));
        },
        onMetadata: (meta) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempAssistantMsg.id
                ? {
                    ...m,
                    id: meta.message_id || m.id,
                    citations: meta.citations,
                    extra_metadata: meta.tool_calls ? { tool_calls: meta.tool_calls } : undefined,
                  }
                : m
            ),
            conversations: state.conversations.map((c) =>
              c.id === meta.conversation_id
                ? { ...c, title: c.title === 'New Chat' ? text.slice(0, 30) + '...' : c.title }
                : c
            ),
          }));
        },
        onDone: () => {
          set({ isStreaming: false, streamingMessageId: null, abortController: null });
        },
        onError: (err) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempAssistantMsg.id
                ? { ...m, content: m.content + `\n\n*[Connection error: ${err.message}]*` }
                : m
            ),
            isStreaming: false,
            streamingMessageId: null,
            abortController: null,
          }));
        },
      },
      controller.signal
    );
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ isStreaming: false, streamingMessageId: null, abortController: null });
  },
}));

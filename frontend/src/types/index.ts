export interface Citation {
  document_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  page?: number;
  similarity_score?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  citations?: Citation[];
  extra_metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'processing' | 'ready' | 'failed';
  error_message?: string;
  chunks_count?: number;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  memory_type: string;
  importance: number;
  source: string;
  created_at: string;
}

export interface ModelItem {
  id: string;
  name: string;
  provider: string;
  is_local: boolean;
  context_length?: number;
  description?: string;
  is_selected?: boolean;
}

export interface AppSettings {
  app_name: string;
  app_env: string;
  llm_provider: string;
  default_model: string;
  temperature: number;
  enable_rag: boolean;
  enable_memory: boolean;
  enable_tools: boolean;
  enable_agents: boolean;
  max_context_tokens: number;
  theme: string;
}

export interface SystemHealth {
  status: string;
  backend: string;
  database: string;
  vector_store: string;
  llm_provider: string;
  available_providers: string[];
  active_model: string;
  storage: {
    upload_dir: string;
    upload_dir_ready: boolean;
  };
}

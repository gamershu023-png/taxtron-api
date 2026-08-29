export type MessageRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageUri?: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse {
  result?: string;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
}

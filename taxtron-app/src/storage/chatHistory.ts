import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatSession, ChatMessage } from '../types';

const STORAGE_KEY = 'taxtron_chat_sessions';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function loadSessions(): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: ChatSession[] = JSON.parse(raw);
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: ChatSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat sessions:', e);
  }
}

export async function createSession(firstMessage: string): Promise<ChatSession> {
  const title = firstMessage.length > 40
    ? firstMessage.slice(0, 40) + '…'
    : firstMessage;
  return {
    id: generateId(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function addMessageToSession(
  sessions: ChatSession[],
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>
): Promise<ChatSession[]> {
  const fullMessage: ChatMessage = {
    ...message,
    id: generateId(),
    createdAt: Date.now(),
  };
  const updated = sessions.map((s) => {
    if (s.id !== sessionId) return s;
    return {
      ...s,
      messages: [...s.messages, fullMessage],
      updatedAt: Date.now(),
    };
  });
  await saveSessions(updated);
  return updated;
}

export async function deleteSession(
  sessions: ChatSession[],
  sessionId: string
): Promise<ChatSession[]> {
  const updated = sessions.filter((s) => s.id !== sessionId);
  await saveSessions(updated);
  return updated;
}

export async function clearAllSessions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

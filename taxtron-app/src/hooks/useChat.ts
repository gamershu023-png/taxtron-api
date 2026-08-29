import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSession, ChatMessage } from '../types';
import {
  loadSessions,
  saveSessions,
  createSession,
  addMessageToSession,
  deleteSession,
} from '../storage/chatHistory';
import { generateResponse } from '../services/api';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      const loaded = await loadSessions();
      if (isMounted.current) setSessions(loaded);
    })();
    return () => { isMounted.current = false; };
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const sendMessage = useCallback(
    async (text: string, imageUri?: string) => {
      setError(null);
      setLoading(true);

      try {
        let currentSessions = sessions;
        let sessionId = activeSessionId;

        if (!sessionId) {
          const newSession = await createSession(text);
          sessionId = newSession.id;
          currentSessions = [...sessions, newSession];
          setSessions(currentSessions);
          setActiveSessionId(sessionId);
        }

        currentSessions = await addMessageToSession(currentSessions, sessionId!, {
          role: 'user',
          content: text,
          imageUri,
        });
        setSessions(currentSessions);

        const prompt = `You are an expert engineering tutor. The student asks:\n\n${text}\n\nProvide a clear, detailed, well-structured answer. Use Markdown with formulas in inline code, numbered derivations, tables where helpful. Be thorough but direct.`;

        const result = await generateResponse(prompt, undefined);

        currentSessions = await addMessageToSession(currentSessions, sessionId!, {
          role: 'bot',
          content: result,
        });
        if (isMounted.current) setSessions(currentSessions);
      } catch (e: any) {
        if (isMounted.current) {
          setError(e.message || 'Something went wrong. Please try again.');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [sessions, activeSessionId]
  );

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setError(null);
  }, []);

  const deleteChat = useCallback(
    async (id: string) => {
      const updated = await deleteSession(sessions, id);
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [sessions, activeSessionId]
  );

  const selectChat = useCallback((id: string) => {
    setActiveSessionId(id);
    setError(null);
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    loading,
    error,
    sendMessage,
    startNewChat,
    deleteChat,
    selectChat,
    retry: () => setError(null),
  };
}

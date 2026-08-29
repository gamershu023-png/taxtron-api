import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useChat } from '../hooks/useChat';
import { ChatBubble } from '../components/ChatBubble';
import { ChatInput } from '../components/ChatInput';
import { LoadingDots } from '../components/LoadingDots';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { colors, spacing, typography } from '../theme';
import type { ChatMessage } from '../types';

export function AIScreen() {
  const {
    sessions,
    activeSession,
    activeSessionId,
    loading,
    error,
    sendMessage,
    startNewChat,
    selectChat,
    deleteChat,
    retry,
  } = useChat();

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  function handleRetry() {
    retry();
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content, lastUserMsg.imageUri);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={startNewChat} accessibilityLabel="Start new chat" accessibilityRole="button">
          <Text style={styles.newChatBtn}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      {messages.length === 0 && !loading && !error && (
        <EmptyState
          icon="🤖"
          title="Ask Taxtron AI"
          message="Type a question about Physics, Chemistry, or Maths to get a step-by-step answer."
        />
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {loading && <LoadingDots />}

      {error && <ErrorState message={error} onRetry={handleRetry} />}

      <ChatInput onSend={(text) => sendMessage(text)} disabled={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  newChatBtn: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
});

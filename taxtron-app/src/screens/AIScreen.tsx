import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { useChat } from '../hooks/useChat';
import { ChatBubble } from '../components/ChatBubble';
import { ChatInput } from '../components/ChatInput';
import { LoadingDots } from '../components/LoadingDots';
import { ErrorState } from '../components/ErrorState';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { ChatMessage } from '../types';

const SUGGESTIONS = [
  'Explain projectile motion',
  "Derive Ohm's law",
  'What is SHM?',
  'Wave interference basics',
];

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

  const handleRetry = useCallback(() => {
    retry();
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content, lastUserMsg.imageUri);
    }
  }, [messages, retry, sendMessage]);

  const handleSuggestion = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const hasMessages = messages.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerDot} />
            <Text style={styles.headerTitle}>Taxtron AI</Text>
          </View>
          <TouchableOpacity
            onPress={startNewChat}
            accessibilityLabel="Start new chat"
            accessibilityRole="button"
            style={styles.newChatBtn}
          >
            <Text style={styles.newChatText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state with suggestions */}
        {!hasMessages && !loading && !error && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>T</Text>
            </View>
            <Text style={styles.emptyTitle}>Explore any concept</Text>
            <Text style={styles.emptyDesc}>
              Ask about Physics, Chemistry, or Maths. Get step-by-step
              explanations, derivations, and worked examples.
            </Text>
            <View style={styles.suggestionWrap}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestion(s)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Ask: ${s}`}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                  <Text style={styles.suggestionArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Conversation list */}
        {hasMessages && (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingRow}>
            <LoadingDots />
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.errorRow}>
            <ErrorState message={error} onRetry={handleRetry} />
          </View>
        )}

        {/* Input */}
        <ChatInput
          onSend={(text) => sendMessage(text)}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textMain,
  },
  newChatBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  newChatText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.glow,
  },
  emptyIcon: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.textMain,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  suggestionWrap: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.sm,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  suggestionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  suggestionArrow: {
    fontSize: 14,
    color: colors.primary,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  loadingRow: {
    paddingHorizontal: spacing.md,
  },
  errorRow: {
    paddingHorizontal: spacing.md,
  },
});

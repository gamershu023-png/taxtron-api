import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';
import { colors, spacing, radius, typography } from '../theme';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {message.imageUri && (
          <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: radius.sm,
  },
  botBubble: {
    backgroundColor: colors.botBubble,
    borderBottomLeftRadius: radius.sm,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMain,
    lineHeight: 22,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { RootStackParamList } from '../types/nav';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const features = [
  { id: 'AI', title: 'Taxtron AI', subtitle: 'Ask anything. Get step-by-step answers.', icon: '🤖', tab: 'AI' },
  { id: 'Scan', title: 'Scan', subtitle: 'Photograph a question or textbook page.', icon: '📷', tab: 'Scan' },
  { id: 'Tools', title: 'Tools', subtitle: 'Calculators and educational utilities.', icon: '🧮', tab: 'Tools' },
  { id: 'Profile', title: 'Profile', subtitle: 'Your account and settings.', icon: '👤', tab: 'Profile' },
];

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Taxtron</Text>
        <Text style={styles.subtitle}>AI-powered JEE preparation for serious aspirants</Text>
      </View>

      <View style={styles.grid}>
        {features.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={styles.card}
            onPress={() => navigation.navigate(f.tab as any)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={f.title}
          >
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardSubtitle}>{f.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.heading,
    fontSize: 42,
    color: colors.textMain,
    letterSpacing: -1,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

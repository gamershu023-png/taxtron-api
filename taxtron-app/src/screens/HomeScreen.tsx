import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { BottomTabParamList } from '../App';
import { loadSessions } from '../storage/chatHistory';
import type { ChatSession } from '../types';

type NavProp = BottomTabNavigationProp<BottomTabParamList>;

const features = [
  {
    id: 'AI',
    title: 'Taxtron AI',
    subtitle: 'Ask anything. Get step-by-step answers.',
    glyph: 'AI',
    tab: 'AI' as const,
    accent: colors.primary,
  },
  {
    id: 'Scan',
    title: 'Scan',
    subtitle: 'Photograph a question or textbook page.',
    glyph: 'SCAN',
    tab: 'Scan' as const,
    accent: colors.secondary,
  },
  {
    id: 'Tools',
    title: 'Tools',
    subtitle: 'Calculators and educational utilities.',
    glyph: 'TOOLS',
    tab: 'Tools' as const,
    accent: colors.primary,
  },
];

const suggestions = [
  'Projectile Motion',
  "Ohm's Law",
  'Simple Harmonic Motion',
  'Wave Interference',
];

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    loadSessions().then(setRecentSessions).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>TAXTRON</Text>
            <Text style={styles.brandTag}>Intelligent tools + AI</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Text style={styles.avatarText}>T</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroTitle}>Taxtron AI</Text>
          <Text style={styles.heroDesc}>
            Your intelligent assistant for Physics, Chemistry, and Maths.
            Get step-by-step answers, derivations, and worked examples.
          </Text>
          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => navigation.navigate('AI')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Start using Taxtron AI"
          >
            <Text style={styles.heroCtaText}>Start Exploring</Text>
            <Text style={styles.heroCtaArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick suggestions */}
        <View style={styles.suggestionRow}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => navigation.navigate('AI')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Explore ${s}`}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature cards */}
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
        <View style={styles.featureGrid}>
          {features.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={styles.featureCard}
              onPress={() => navigation.navigate(f.tab)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={f.title}
            >
              <View style={[styles.featureGlyph, { borderColor: f.accent }]}>
                <Text style={[styles.featureGlyphText, { color: f.accent }]}>
                  {f.glyph}
                </Text>
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionLabel}>RECENT CONVERSATIONS</Text>
        {recentSessions.length > 0 ? (
          <View style={styles.recentList}>
            {recentSessions.slice(0, 4).map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.recentItem}
                onPress={() => navigation.navigate('AI')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Open conversation ${s.title}`}
              >
                <View style={styles.recentDot} />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.recentMeta}>
                    {s.messages.length} messages
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.recentEmpty}>
            <Text style={styles.recentEmptyText}>
              No conversations yet. Start chatting with Taxtron AI.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandName: {
    ...typography.heading,
    fontSize: 22,
    color: colors.textMain,
    letterSpacing: 2,
  },
  brandTag: {
    ...typography.caption,
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardSolid,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  hero: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.card,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  heroTitle: {
    ...typography.heading,
    fontSize: 28,
    color: colors.textMain,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  heroDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    ...typography.heading,
    fontSize: 15,
    color: colors.background,
  },
  heroCtaArrow: {
    fontSize: 15,
    color: colors.background,
    marginLeft: spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  featureGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  featureGlyph: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.background,
  },
  featureGlyphText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featureTitle: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textMain,
    marginBottom: 2,
  },
  featureSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  recentList: {
    gap: spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMain,
    fontWeight: '500',
  },
  recentMeta: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentEmpty: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  recentEmptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing, radius, typography, shadows } from '../theme';
import type { ToolItem } from '../types';

const tools: ToolItem[] = [
  { id: '1', title: 'Physics Calculator', description: 'Solve mechanics, optics, and electromagnetism problems.', icon: '⚡', available: false },
  { id: '2', title: 'Chemistry Equation Balancer', description: 'Balance chemical equations instantly.', icon: '⚗️', available: false },
  { id: '3', title: 'Math Solver', description: 'Step-by-step solutions for calculus, algebra, and more.', icon: '📐', available: false },
  { id: '4', title: 'Unit Converter', description: 'Convert between SI and common engineering units.', icon: '🔄', available: false },
  { id: '5', title: 'Formula Reference', description: 'Quick access to JEE physics, chemistry, and maths formulas.', icon: '📚', available: false },
  { id: '6', title: 'Mock Test Generator', description: 'Generate custom practice tests by topic and difficulty.', icon: '📝', available: false },
];

export function ToolsScreen() {
  function renderTool({ item }: { item: ToolItem }) {
    return (
      <TouchableOpacity
        style={[styles.card, !item.available && styles.cardDisabled]}
        disabled={!item.available}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}${item.available ? '' : ', coming soon'}`}
      >
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={styles.textSection}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {!item.available && <Text style={styles.badge}>Coming Soon</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tools}
        keyExtractor={(item) => item.id}
        renderItem={renderTool}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tools</Text>
            <Text style={styles.headerSubtitle}>Educational calculators and utilities</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="🧮" title="No tools available" message="Tools will appear here in a future update." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 28,
    color: colors.textMain,
  marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  badge: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

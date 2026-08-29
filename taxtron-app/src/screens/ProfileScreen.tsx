import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { isAuthConfigured, signInWithEmail, signUpWithEmail } from '../services/auth';

export function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isAuthConfigured()) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.mutedText}>
            Authentication is not configured. Set EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable login.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.mutedText}>Loading…</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.cardTitle}>{user.displayName}</Text>
          <Text style={styles.mutedText}>{user.email}</Text>
          <View style={styles.divider} />
          <Text style={styles.welcomeText}>
            Welcome back, {user.displayName.split(' ')[0]}. Ready to continue
            your journey with Taxtron AI.
          </Text>
          <PrimaryButton
            label="Sign Out"
            onPress={signOut}
            variant="danger"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
    } catch (e: any) {
      setFormError(e.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          accessibilityLabel="Email address"
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          accessibilityLabel="Password"
        />

        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <PrimaryButton
          label={mode === 'signin' ? 'Sign In' : 'Create Account'}
          onPress={handleSubmit}
          loading={busy}
          disabled={busy}
        />

        <Text
          style={styles.switchText}
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setFormError(null);
          }}
          accessibilityRole="button"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.cardSolid,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.background,
  },
  cardTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  mutedText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: spacing.md,
  },
  switchText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: '600',
  },
});

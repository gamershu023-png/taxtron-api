import { createClient, Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: ExpoSecureStoreAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function isAuthConfigured(): boolean {
  return supabase !== null;
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    displayName: user.email ? user.email.split('@')[0] : 'User',
  };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<void> {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(
  callback: (user: AuthUser | null) => void
): () => void {
  if (!supabase) {
    callback(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}

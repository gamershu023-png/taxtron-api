import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types';
import { onAuthChange, getCurrentSession, toAuthUser, signOut } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const session = await getCurrentSession();
      if (session?.user) {
        setUser(toAuthUser(session.user));
      }
      setLoading(false);
      unsubscribe = onAuthChange((u) => setUser(u));
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return { user, loading, signOut: handleSignOut };
}

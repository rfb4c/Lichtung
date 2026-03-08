import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import { mapProfile, type ProfileRow } from '../lib/mappers';
import type { UserProfile } from '../types';

type AuthMode = 'login' | 'register';

interface AuthContextValue {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  authModalMode: AuthMode | null;
  handleLogin: (email: string, password: string) => Promise<string | null>;
  handleRegister: (email: string, password: string, displayName: string) => Promise<string | null>;
  handleLogout: () => Promise<void>;
  handleUpdateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl' | 'city' | 'profession' | 'interests' | 'identities'>>) => Promise<string | null>;
  showAuth: (mode: AuthMode) => void;
  hideAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) {
      setUser(null);
      return;
    }
    setUser(mapProfile(data as ProfileRow));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    setAuthModalMode(null);
    return null;
  }, []);

  const handleRegister = useCallback(async (email: string, password: string, displayName: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return error.message;
    setAuthModalMode(null);
    return null;
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const handleUpdateProfile = useCallback(async (
    updates: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl' | 'city' | 'profession' | 'interests' | 'identities'>>
  ): Promise<string | null> => {
    if (!session?.user) return '未登录';
    const row: Record<string, unknown> = {};
    if (updates.displayName !== undefined) row.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl;
    if (updates.city !== undefined) row.city = updates.city;
    if (updates.profession !== undefined) row.profession = updates.profession;
    if (updates.interests !== undefined) row.interests = updates.interests;
    if (updates.identities !== undefined) row.identities = updates.identities;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', session.user.id);
    if (error) return error.message;
    await fetchProfile(session.user.id);
    return null;
  }, [session, fetchProfile]);

  const showAuth = useCallback((mode: AuthMode) => setAuthModalMode(mode), []);
  const hideAuth = useCallback(() => setAuthModalMode(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: !!user,
      isConfigured: isSupabaseConfigured,
      authModalMode,
      handleLogin,
      handleRegister,
      handleLogout,
      handleUpdateProfile,
      showAuth,
      hideAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

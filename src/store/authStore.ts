import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || "");
let postAuthLoadingTimeout: ReturnType<typeof setTimeout> | null = null;

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  postAuthLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  triggerPostAuthLoading: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,
  postAuthLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  triggerPostAuthLoading: () => {
    if (postAuthLoadingTimeout) {
      clearTimeout(postAuthLoadingTimeout);
    }
    set({ postAuthLoading: true });
    postAuthLoadingTimeout = setTimeout(() => {
      set({ postAuthLoading: false });
    }, 2000);
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (postAuthLoadingTimeout) {
        clearTimeout(postAuthLoadingTimeout);
      }
      set({ user: data.user, session: data.session, postAuthLoading: true });
      postAuthLoadingTimeout = setTimeout(() => {
        set({ postAuthLoading: false });
      }, 2000);
      void get().fetchProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signUp: async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Create profile in Convex
        await convex.mutation(api.profiles.updateProfile, {
          userId: data.user.id,
          updates: {
            username,
            fullName: username,
          }
        });
      }

      set({ user: data.user, session: data.session });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    if (postAuthLoadingTimeout) {
      clearTimeout(postAuthLoadingTimeout);
      postAuthLoadingTimeout = null;
    }
    set({ user: null, session: null, profile: null, postAuthLoading: false });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const data = await convex.query(api.profiles.getProfile, { userId: user.id });
      if (data) {
        set({ profile: data as any });
      }
    } catch (error) {
      console.error("Error fetching profile from Convex:", error);
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return { error: new Error('Not authenticated') };

    try {
      await convex.mutation(api.profiles.updateProfile, {
        userId: user.id,
        updates: {
          username: updates.username || undefined,
          fullName: updates.fullName || undefined,
          avatarUrl: updates.avatarUrl || undefined,
        }
      });
      await get().fetchProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ user: session.user, session });
        await get().fetchProfile();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          // Only trigger loading animation if we weren't already authenticated
          if (!get().user) {
            if (postAuthLoadingTimeout) {
              clearTimeout(postAuthLoadingTimeout);
            }
            set({ postAuthLoading: true });
            postAuthLoadingTimeout = setTimeout(() => {
              set({ postAuthLoading: false });
            }, 2000);
          }
        }

        set({ user: session?.user ?? null, session });
        if (session?.user) {
          await get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));

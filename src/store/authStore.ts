import { create } from 'zustand';
// Supabase types removed
// Supabase removed for Clerk
import { Profile } from '@/types';
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || "");
let postAuthLoadingTimeout: ReturnType<typeof setTimeout> | null = null;

interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  postAuthLoading: boolean;
  setUser: (user: any | null) => void;
  setSession: (session: any | null) => void;
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
    // Legacy Supabase signIn removed for Clerk
    console.warn("Legacy signIn called - use Clerk instead");
    return { error: new Error("Use Clerk for authentication") };
  },

  signUp: async (email, password, username) => {
    // Legacy Supabase signUp removed for Clerk
    console.warn("Legacy signUp called - use Clerk instead");
    return { error: new Error("Use Clerk for authentication") };
  },

  signOut: async () => {
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
      const data = await convex.query(api.profiles.getProfile, { userId: (user as any).id });
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
        userId: (user as any).id,
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

  initialize: async () => { set({ loading: false, initialized: true }); }
}));

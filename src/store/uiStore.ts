import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type View = 'dashboard' | 'code' | 'prompts' | 'files' | 'projects' | 'settings' | 'documentation' | 'chat' | 'community' | 'referral' | 'help' | 'favorites' | 'video-tutorial';
type ModalType = 'auth' | 'item' | 'project' | 'project-note' | 'project-view' | 'project-updates' | 'team-onboarding' | 'command' | 'invite-member' | null;

interface UIState {
  currentView: View;
  sidebarCollapsed: boolean;
  activeModal: ModalType;
  modalData: any;
  activeTeamId: string | null;
  searchQuery: string;
  initializedViews: Set<string>;
  toasts: Toast[];
  setCurrentView: (view: View) => void;
  toggleSidebar: () => void;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  setActiveTeamId: (teamId: string | null) => void;
  setSearchQuery: (query: string) => void;
  markViewInitialized: (view: View) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,
      activeTeamId: null,
      searchQuery: '',
      initializedViews: new Set<string>(),
      toasts: [],

      setCurrentView: (view) => set({ currentView: view }),

      markViewInitialized: (view) => set((state) => {
        const next = new Set(state.initializedViews);
        next.add(view);
        return { initializedViews: next };
      }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      openModal: (type, data = null) => set({ activeModal: type, modalData: data }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      setActiveTeamId: (teamId) => set({ activeTeamId: teamId }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }),
    {
      name: 'vibe-vault-ui-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        sidebarCollapsed: state.sidebarCollapsed,
        activeTeamId: state.activeTeamId,
      }),
    }
  )
);

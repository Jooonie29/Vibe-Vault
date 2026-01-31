import { create } from 'zustand';

type View = 'dashboard' | 'code' | 'prompts' | 'files' | 'projects' | 'settings';
type ModalType = 'auth' | 'item' | 'project' | 'project-note' | 'project-view' | 'command' | null;

interface UIState {
  currentView: View;
  sidebarCollapsed: boolean;
  activeModal: ModalType;
  modalData: any;
  searchQuery: string;
  toasts: Toast[];
  setCurrentView: (view: View) => void;
  toggleSidebar: () => void;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  setSearchQuery: (query: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentView: 'dashboard',
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  searchQuery: '',
  toasts: [],

  setCurrentView: (view) => set({ currentView: view }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openModal: (type, data = null) => set({ activeModal: type, modalData: data }),

  closeModal: () => set({ activeModal: null, modalData: null }),

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
}));

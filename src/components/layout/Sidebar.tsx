import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  Settings,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'code', label: 'Code Library', icon: Code2 },
  { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
  { id: 'files', label: 'File Assets', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Kanban },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { signOut } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className={`p-4 flex items-center border-b border-gray-100 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Vibe Vault Logo" className="w-full h-full object-contain" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-xl text-gray-900">Vibe Vault</h1>
            <p className="text-xs text-gray-500">Developer Hub</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center rounded-xl transition-all
                ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                py-2.5
                ${isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <motion.button
          onClick={() => setCurrentView('settings')}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center rounded-xl transition-all
            ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
            py-2.5
            ${currentView === 'settings'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium">Settings</span>}
        </motion.button>

        <motion.button
          onClick={signOut}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center rounded-xl transition-all text-gray-600 hover:bg-red-50 hover:text-red-600 ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
        </motion.button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

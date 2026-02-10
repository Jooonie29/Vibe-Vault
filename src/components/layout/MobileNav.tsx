import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Code2, MessageSquare, FolderOpen, Kanban, Menu, X, Sparkles, Settings, LayoutGrid } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'prompts', label: 'Prompts', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Kanban },
];

export function MobileNav() {
  const { currentView, setCurrentView, setActiveTeamId } = useUIStore();
  const { profile } = useAuthStore();
  const { user: clerkUser } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img
              src="/Vault Vibe_black.png"
              alt="Vault Vibe"
              className="w-9 h-9 object-contain dark:hidden"
            />
            <img
              src="/Vault Vibe_white.png"
              alt="Vault Vibe"
              className="w-9 h-9 object-contain hidden dark:block"
            />
            <span className="font-bold text-lg text-foreground tracking-tight">Vault Vibe</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-accent text-foreground"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-background z-50 md:hidden border-r border-border"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img
                  src="/Vault Vibe_black.png"
                  alt="Vault Vibe"
                  className="w-11 h-11 object-contain dark:hidden"
                />
                <img
                  src="/Vault Vibe_white.png"
                  alt="Vault Vibe"
                  className="w-11 h-11 object-contain hidden dark:block"
                />
                <div>
                  <h1 className="font-bold text-xl text-foreground tracking-tight">Vault Vibe</h1>
                  <p className="text-xs text-muted-foreground">{clerkUser?.username || clerkUser?.firstName || profile?.username || 'Developer'}</p>
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as any);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-1">
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveTeamId(null);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="font-medium">Back to menu</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

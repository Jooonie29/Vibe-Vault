import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  Settings,
  Plus,
  LayoutDashboard,
  X
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: 'navigate', target: 'dashboard' },
  { id: 'code', label: 'Go to Code Library', icon: Code2, action: 'navigate', target: 'code' },
  { id: 'prompts', label: 'Go to AI Prompts', icon: MessageSquare, action: 'navigate', target: 'prompts' },
  { id: 'files', label: 'Go to File Assets', icon: FolderOpen, action: 'navigate', target: 'files' },
  { id: 'projects', label: 'Go to Projects', icon: Kanban, action: 'navigate', target: 'projects' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, action: 'navigate', target: 'settings' },
  { id: 'new-snippet', label: 'Create New Snippet', icon: Plus, action: 'modal', target: 'code' },
  { id: 'new-prompt', label: 'Create New Prompt', icon: Plus, action: 'modal', target: 'prompt' },
  { id: 'new-project', label: 'Create New Project', icon: Plus, action: 'modal', target: 'project' },
];

export function CommandPalette() {
  const { activeModal, closeModal, setCurrentView, openModal } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isOpen = activeModal === 'command';

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal('command');
        }
      }

      if (!isOpen) return;

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) executeCommand(cmd);
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const executeCommand = (cmd: typeof commands[0]) => {
    if (cmd.action === 'navigate') {
      setCurrentView(cmd.target as any);
    } else if (cmd.action === 'modal') {
      if (cmd.target === 'project') {
        openModal('project');
      } else {
        openModal('item', { type: cmd.target });
      }
      return; // Don't close modal yet
    }
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-base"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500 font-medium">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No commands found
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${index === selectedIndex
                          ? 'bg-violet-50 text-violet-900'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === selectedIndex ? 'bg-violet-100' : 'bg-gray-100'
                        }`}>
                        <Icon className={`w-4 h-4 ${index === selectedIndex ? 'text-violet-600' : 'text-gray-500'
                          }`} />
                      </div>
                      <span className="font-medium">{cmd.label}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200">↵</kbd>
                  to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />K to toggle
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

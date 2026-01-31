import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ItemsGrid } from '@/components/items/ItemsGrid';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { FileManager } from '@/components/files/FileManager';
import { Settings } from '@/components/settings/Settings';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { ItemModal } from '@/components/items/ItemModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { ProjectNoteModal } from '@/components/projects/ProjectNoteModal';
import { ProjectViewModal } from '@/components/projects/ProjectViewModal';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ToastContainer } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const AppLayout: React.FC = () => {
  const { user, loading, initialized, initialize, postAuthLoading } = useAuthStore();
  const { currentView, sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();


  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading Vibe Vault...</p>
        </div>
      </div>
    );
  }

  if (postAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img
              src="/Vibe%20Vault%20logo-white.png"
              alt="Vibe Vault Logo"
              className="w-10 h-10 object-contain animate-float"
            />
          </div>
          <p className="text-gray-500 font-medium">Preparing your vault...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <>
        <LandingPage />
        <AuthModal />
        <ToastContainer />
      </>
    );
  }

  // Render the main app for authenticated users
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'code':
        return (
          <ItemsGrid
            type="code"
            title="Code Library"
            description="Store and organize your reusable code snippets"
          />
        );
      case 'prompts':
        return (
          <ItemsGrid
            type="prompt"
            title="AI Prompts"
            description="Your collection of engineered prompts for LLMs"
          />
        );
      case 'files':
        return <FileManager />;
      case 'projects':
        return <KanbanBoard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Calculate margins based on screen size
  const mainStyle = isMobile
    ? { marginLeft: 0, marginRight: 0 }
    : {
      marginLeft: sidebarCollapsed ? 80 : 260,
      marginRight: 0,
    };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}

      {/* Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <main
        className="transition-all duration-300"
        style={mainStyle}
      >
        <div className={`p-4 md:p-6 min-h-screen ${isMobile ? 'pt-16 pb-20' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AuthModal />
      <ItemModal />
      <ProjectModal />
      <ProjectNoteModal />
      <ProjectViewModal />
      <CommandPalette />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;

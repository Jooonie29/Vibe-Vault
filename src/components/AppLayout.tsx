import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from "@clerk/clerk-react";
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
import { ProjectUpdatesModal } from '@/components/projects/ProjectUpdatesModal';
import { TeamOnboarding } from '@/components/teams/TeamOnboarding';
import { InviteModal } from '@/components/teams/InviteModal';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ToastContainer } from '@/components/ui/Toast.tsx';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Documentation } from '@/components/learn/Documentation';
import { VideoTutorial } from '@/components/learn/VideoTutorial';
import { ChatSupport } from '@/components/support/ChatSupport';
import { Community } from '@/components/support/Community';
import { Referral } from '@/components/support/Referral';
import { HelpCenter } from '@/components/support/HelpCenter';
import { Favorites } from '@/components/favorites/Favorites';
import { FloatingChat } from '@/components/chat/FloatingChat';

const AppLayout: React.FC = () => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { user: storeUser, loading: storeLoading, initialized, initialize, postAuthLoading, setUser } = useAuthStore();
  const { currentView, sidebarCollapsed, activeTeamId, setActiveTeamId, addToast } = useUIStore();
  const isMobile = useIsMobile();

  // Track which views have been visited to keep them mounted
  // Initialize with 'dashboard' to ensure it's always ready
  const [visitedViews, setVisitedViews] = useState<Set<string>>(new Set(['dashboard']));

  useEffect(() => {
    initialize();
  }, [initialize]);



  const updateProfile = useMutation(api.profiles.updateProfile);

  useEffect(() => {
    const syncProfile = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        setUser(clerkUser as any);
        try {
          await updateProfile({
            userId: clerkUser.id,
            updates: {
              username: clerkUser.username || clerkUser.firstName || 'User',
              fullName: clerkUser.fullName || (clerkUser.firstName + ' ' + clerkUser.lastName).trim(),
              avatarUrl: clerkUser.imageUrl,
            }
          });
        } catch (error) {
          console.error('Failed to sync profile:', error);
        }
      }
    };
    syncProfile();
  }, [isLoaded, isSignedIn, clerkUser, setUser, updateProfile]);

  useEffect(() => {
    if (initialized && !storeLoading && !storeUser && !isSignedIn) {
      setActiveTeamId(null);
    }
  }, [storeUser, initialized, storeLoading, setActiveTeamId, isSignedIn]);

  // Update visited views when currentView changes
  useEffect(() => {
    setVisitedViews(prev => {
      const newSet = new Set(prev);
      newSet.add(currentView);
      return newSet;
    });
  }, [currentView]);

  // Show loading screen while initializing
  if (!isLoaded || storeLoading) {
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
              src="/logo-white.png"
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
  if (!isSignedIn) {
    return (
      <>
        <LandingPage />
        <AuthModal />
        <ToastContainer />
      </>
    );
  }

  if (!activeTeamId) {
    return (
      <>
        <TeamOnboarding />
        <ToastContainer />
      </>
    );
  }

  // Helper to render specific view content
  const renderViewContent = (view: string) => {
    switch (view) {
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
      case 'favorites':
        return <Favorites />;
      case 'documentation':
        return <Documentation />;
      case 'video-tutorial':
        return <VideoTutorial />;
      case 'chat':
        return <ChatSupport />;
      case 'community':
        return <Community />;
      case 'referral':
        return <Referral />;
      case 'help':
        return <HelpCenter />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  // Calculate margins based on screen size
  const mainStyle = isMobile
    ? { marginLeft: 0, marginRight: 0 }
    : {
      marginLeft: sidebarCollapsed ? 80 : 250,
      marginRight: 0,
    };

  return (
    <div className="min-h-screen bg-background vibe-depth-bg transition-colors duration-500">
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
          {/* Render all visited views, but hide inactive ones */}
          {Array.from(visitedViews).map((view) => (
            <div
              key={view}
              className={`${view === currentView ? 'block' : 'hidden'}`}
            >
              {renderViewContent(view)}
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      <AuthModal />
      <ItemModal />
      <ProjectModal />
      <ProjectNoteModal />
      <ProjectViewModal />
      <ProjectUpdatesModal />
      <InviteModal />
      <CommandPalette />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Floating Chat Widget */}
      <FloatingChat />
    </div>
  );
};

export default AppLayout;
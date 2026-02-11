import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import React, { useEffect, useMemo, useState } from 'react';
import { useUser, useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from 'react-router-dom';
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
import { VaultLoading } from '@/components/loading/VaultLoading';
import { RefreshLoading } from '@/components/loading/RefreshLoading';
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
  const { user: storeUser, loading: storeLoading, initialized, initialize, postAuthLoading, setUser, fetchProfile } = useAuthStore();
  const { currentView, sidebarCollapsed, activeTeamId, setActiveTeamId, addToast, openModal } = useUIStore();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showLoader, setShowLoader] = useState(true);
  
  // Detect if this is the first visit or a refresh
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const hasVisited = sessionStorage.getItem('vaultVibeVisited');
    if (!hasVisited) {
      sessionStorage.setItem('vaultVibeVisited', 'true');
      return true;
    }
    return false;
  });

  // Track which views have been visited to keep them mounted
  // Initialize with 'dashboard' to ensure it's always ready
  const [visitedViews, setVisitedViews] = useState<Set<string>>(new Set(['dashboard']));

  useEffect(() => {
    initialize();
  }, [initialize]);



  const updateProfile = useMutation(api.profiles.updateProfile);
  const applyReferral = useMutation(api.profiles.applyReferral);

  const referralParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref") || params.get("referral");
    return ref ? ref.toLowerCase() : "";
  }, [location.search]);
  const migrateLegacyOwnerItemsToTeam = useMutation(api.items.migrateLegacyOwnerItemsToTeam);
  const migrateLegacyOwnerTagsToTeam = useMutation(api.tags.migrateLegacyOwnerTagsToTeam);

  useEffect(() => {
    const syncProfile = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        setUser(clerkUser as any);
        try {
          const email =
            clerkUser.primaryEmailAddress?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            undefined;

          await updateProfile({
            userId: clerkUser.id,
            updates: {
              username: clerkUser.username || clerkUser.firstName || 'User',
              fullName: clerkUser.fullName || (clerkUser.firstName + ' ' + clerkUser.lastName).trim(),
              avatarUrl: clerkUser.imageUrl,
              email,
            }
          });
          await fetchProfile();
        } catch (error) {
          console.error('Failed to sync profile:', error);
        }
      }
    };
    syncProfile();
  }, [isLoaded, isSignedIn, clerkUser, setUser, updateProfile, fetchProfile]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    if (referralParams) {
      localStorage.setItem("vaultvibe_referral_code", referralParams);
      sessionStorage.setItem("vaultvibe_referral_signup", "true");
      openModal("auth", { view: "register" });
      navigate("/", { replace: true });
      return;
    }
    const shouldOpenSignup = sessionStorage.getItem("vaultvibe_referral_signup");
    if (shouldOpenSignup) {
      openModal("auth", { view: "register" });
      sessionStorage.removeItem("vaultvibe_referral_signup");
    }
  }, [isLoaded, isSignedIn, openModal, referralParams, navigate]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;
    const referralCode = localStorage.getItem("vaultvibe_referral_code");
    if (!referralCode) return;

    const runReferral = async () => {
      try {
        const result = await applyReferral({ userId: clerkUser.id, referralCode });
        if (result?.applied) {
          addToast({
            type: "success",
            title: "Referral applied",
            message: "Your free month of Pro is active.",
          });
        }
        await fetchProfile();
      } catch (error) {
        console.error("Failed to apply referral:", error);
      } finally {
        localStorage.removeItem("vaultvibe_referral_code");
      }
    };

    runReferral();
  }, [isLoaded, isSignedIn, clerkUser, applyReferral, addToast, fetchProfile]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || !activeTeamId) return;

    const run = async () => {
      try {
        const [migratedItems, migratedTags] = await Promise.all([
          migrateLegacyOwnerItemsToTeam({ userId: clerkUser.id, teamId: activeTeamId as any }),
          migrateLegacyOwnerTagsToTeam({ userId: clerkUser.id, teamId: activeTeamId as any }),
        ]);

        const total = (migratedItems || 0) + (migratedTags || 0);
        if (total > 0) {
          addToast({
            type: 'success',
            title: 'Workspace synced',
            message: `Migrated ${migratedItems} items and ${migratedTags} tags to this workspace.`,
          });
        }
      } catch (error) {
        console.error('Failed to migrate legacy workspace data:', error);
      }
    };

    run();
  }, [isLoaded, isSignedIn, clerkUser, activeTeamId, migrateLegacyOwnerItemsToTeam, migrateLegacyOwnerTagsToTeam, addToast]);

  useEffect(() => {
    if (initialized && !storeLoading && !storeUser && !isSignedIn && isLoaded) {
      setActiveTeamId(null);
    }
  }, [storeUser, initialized, storeLoading, setActiveTeamId, isSignedIn, isLoaded]);

  // Update visited views when currentView changes
  useEffect(() => {
    setVisitedViews(prev => {
      const newSet = new Set(prev);
      newSet.add(currentView);
      return newSet;
    });
  }, [currentView]);

  const isInitializing = !isLoaded || storeLoading;
  const isWorkspaceReady = isSignedIn && !!activeTeamId;
  
  // Only show the initial loader when opening a workspace
  const shouldShowInitLoader = isWorkspaceReady && (
    isFirstVisit
      ? (isInitializing || postAuthLoading || showLoader)
      : isInitializing
  );

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

  // Show landing page for unauthenticated users
  if (!isSignedIn && !shouldShowInitLoader) {
    return (
      <>
        <LandingPage />
        <AuthModal />
        <ToastContainer />
      </>
    );
  }

  // Show team onboarding for authenticated users without a team
  if (isSignedIn && !activeTeamId && !shouldShowInitLoader) {
    return (
      <>
        <TeamOnboarding />
        <ToastContainer />
      </>
    );
  }

  // Show refresh loader for page refreshes (not first visit)
  if (!isFirstVisit && isWorkspaceReady && isInitializing) {
    return <RefreshLoading message="Refreshing Vault Vibe..." />;
  }

  // Show refresh loader for post-auth on refreshes
  if (!isFirstVisit && isWorkspaceReady && postAuthLoading) {
    return <RefreshLoading message="Preparing your vault..." />;
  }

  return (
    <>
      {/* First Visit: Initial Loading Animation - Always completes */}
      {isFirstVisit && isWorkspaceReady && (
        <VaultLoading 
          message="Loading Vault Vibe..."
          subMessage="Unlocking your creative assets"
          variant="initialize"
          isLoading={isInitializing || postAuthLoading}
          onAnimationComplete={() => setShowLoader(false)}
        />
      )}
      
      {/* Main App Content */}
      {isSignedIn && activeTeamId && !shouldShowInitLoader && (
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
      )}
    </>
  );
};

export default AppLayout;

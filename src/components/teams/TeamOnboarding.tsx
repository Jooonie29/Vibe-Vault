import React, { useEffect, useState, useRef } from 'react';
import {
  Users, ArrowRight, Plus, KeyRound, LogOut, Search, Bell, Grid, List,
  MoreHorizontal, Layout, Star, BookOpen, MessageCircle, HelpCircle,
  Video, MessageSquare, Heart, Image as ImageIcon, X, Loader2, Shield, Sun, Moon,
  Zap, Crown, ChevronRight, Settings, Info, Check
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'framer-motion';
import { PricingModal } from '@/components/pricing/PricingModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { UserProfileDropdown } from '@/components/user/UserProfileDropdown';
import { cn } from '@/lib/utils';

// Import pages
import { Favorites } from '@/components/favorites/Favorites';
import { Documentation } from '@/components/learn/Documentation';
import { VideoTutorial } from '@/components/learn/VideoTutorial';
import { ChatSupport } from '@/components/support/ChatSupport';
import { Community } from '@/components/support/Community';
import { Referral } from '@/components/support/Referral';
import { HelpCenter } from '@/components/support/HelpCenter';
import { Settings as SettingsComponent } from '@/components/settings/Settings';


export function TeamOnboarding() {
  const { user, profile, signOut } = useAuthStore();
  const { addToast, setActiveTeamId, setCurrentView } = useUIStore();
  const { theme, setTheme } = useTheme();
  const userId = user?.id || '';
  const displayName = profile?.fullName || profile?.username || user?.email?.split('@')[0] || 'User';

  const teams = useQuery(api.teams.getTeamsForUser, userId ? { userId } : 'skip');
  const usage = useQuery(api.usage.getPlanUsage, userId ? { userId } : "skip");

  const workspacesLimit = usage?.workspaces.limit || 3;
  const workspacesUsed = usage?.workspaces.used || 0;
  const workspacesPercent = Math.min((workspacesUsed / workspacesLimit) * 100, 100);

  const storageLimit = usage?.storage.limitMB || 200;
  const storageUsed = usage?.storage.usedMB || 0;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  const createTeam = useMutation(api.teams.createTeam);
  const updateTeam = useMutation(api.teams.updateTeam);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const acceptInviteByCode = useMutation(api.teams.acceptInviteByCode);

  const [activeSection, setActiveSection] = useState('all-workspaces');
  const [teamForm, setTeamForm] = useState<{ name: string; description: string; coverId?: string }>({
    name: '',
    description: '',
    coverId: undefined
  });
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Management state
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refs for dropdown anchors
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Get notifications for badge count
  const notifications = useQuery(
    api.notifications.getNotifications,
    userId ? { userId } : 'skip'
  );
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  useEffect(() => {
    // Auto-select logic removed as we want the user to pick from the dashboard
  }, [teams]);

  // Listen for navigation events from UserProfileDropdown
  useEffect(() => {
    const handleNavigateSection = (event: CustomEvent<string>) => {
      setActiveSection(event.detail);
    };
    window.addEventListener('navigate-section', handleNavigateSection as EventListener);
    return () => {
      window.removeEventListener('navigate-section', handleNavigateSection as EventListener);
    };
  }, []);

  // Handle opening search (command palette)
  const handleOpenSearch = () => {
    // Trigger Cmd+K to open command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    window.dispatchEvent(event);
  };

  // Handle toggling notifications panel
  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileDropdownOpen(false);
  };

  // Handle toggling profile dropdown
  const handleToggleProfile = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const handleEnterWorkspace = (teamId: string) => {
    setActiveTeamId(teamId);
    setCurrentView('dashboard');
  };

  const handleCreateTeam = async () => {
    if (!user) return;
    if (!teamForm.name.trim()) {
      addToast({ type: 'error', title: 'Workspace name required', message: 'Enter a workspace name to continue.' });
      return;
    }
    setCreating(true);
    try {
      const teamId = await createTeam({
        userId: user.id,
        name: teamForm.name,
        description: teamForm.description || undefined,
        coverId: teamForm.coverId as any,
      });
      setTeamForm({ name: '', description: '', coverId: undefined });
      setIsCreateModalOpen(false);
      setActiveTeamId(teamId as any);
      addToast({ type: 'success', title: 'Workspace created', message: 'Your new workspace is ready.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to create workspace', message: error.message });
    } finally {
      setCreating(false);
    }
  };

  const handleEditWorkspace = (team: any) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      coverId: team.coverId,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWorkspace = async () => {
    if (!user || !editingTeam) return;
    if (!teamForm.name.trim()) {
      addToast({ type: 'error', title: 'Workspace name required', message: 'Enter a workspace name to continue.' });
      return;
    }
    setUpdating(true);
    try {
      await updateTeam({
        userId: user.id,
        teamId: editingTeam._id,
        updates: {
          name: teamForm.name,
          description: teamForm.description || undefined,
          coverId: teamForm.coverId as any,
        },
      });
      setIsEditModalOpen(false);
      setEditingTeam(null);
      setTeamForm({ name: '', description: '', coverId: undefined });
      addToast({ type: 'success', title: 'Workspace updated', message: 'The changes have been saved.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to update workspace', message: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!user || !teamToDelete) return;
    setDeleting(true);
    try {
      await deleteTeam({
        userId: user.id,
        teamId: teamToDelete._id,
      });
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      addToast({ type: 'success', title: 'Workspace deleted', message: 'The workspace has been removed.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to delete workspace', message: error.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!user) return;
    if (!inviteCode.trim()) {
      addToast({ type: 'error', title: 'Invite code required', message: 'Enter a code to join a workspace.' });
      return;
    }
    setJoining(true);
    try {
      const teamId = await acceptInviteByCode({
        userId: user.id,
        code: inviteCode.trim(),
      });
      setInviteCode('');
      setIsJoinModalOpen(false);
      setActiveTeamId(teamId as any);
      addToast({ type: 'success', title: 'Workspace joined', message: 'You now have access to this workspace.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to join workspace', message: error.message });
    } finally {
      setJoining(false);
    }
  };

  const SidebarItem = ({ id, label, icon: Icon, section }: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === id
        ? 'bg-sidebar-accent text-sidebar-foreground'
        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background vibe-depth-bg font-sans transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 bottom-0 z-30 text-sidebar-foreground">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <img src="/logo-black.png" alt="Vibe Vault" className="w-8 h-8 object-contain dark:hidden" />
          <img src="/vibe logo white.png" alt="Vibe Vault" className="w-8 h-8 object-contain hidden dark:block" />
          <span className="font-extrabold text-2xl text-sidebar-foreground tracking-tighter">Vibe Vault</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          {/* Applications Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Applications</h3>
            <div className="space-y-1">
              <SidebarItem id="all-workspaces" label="Workspaces" icon={Layout} />
            </div>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Learn</h3>
            <div className="space-y-1">
              <SidebarItem id="documentation" label="Documentation" icon={BookOpen} />
              <SidebarItem id="video-tutorial" label="Video Tutorial" icon={Video} />
            </div>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Help and Support</h3>
            <div className="space-y-1">
              <SidebarItem id="chat" label="Chat with us" icon={MessageCircle} />
              <SidebarItem id="community" label="Community" icon={Users} />
              <SidebarItem id="referral" label="Refer a friend" icon={Heart} />
              <SidebarItem id="help" label="Help" icon={HelpCircle} />
            </div>
          </div>
        </div>

        {/* Theme Toggle Footer */}
        <div className="p-4 border-t border-sidebar-border mt-auto bg-sidebar">
          {/* Plan Card */}
          <div className="bg-gradient-to-br from-black via-violet-950 to-violet-800 rounded-2xl p-4 shadow-xl shadow-black/40 mb-4 border border-violet-500/30 overflow-hidden relative group">
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-16 h-16 text-violet-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-white mb-3">
                <Crown className="w-4 h-4 text-amber-300" />
                <h3 className="text-xs font-bold">Free Plan Limits</h3>
              </div>

              <div className="w-full space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                    <span>Workspaces</span>
                    <span>{workspacesUsed}/{workspacesLimit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                    <motion.div
                      animate={{ width: `${workspacesPercent}%` }}
                      className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                    <span>Storage</span>
                    <span>{storageUsed}MB / {storageLimit}MB</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storagePercent}%` }}
                      className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4 pt-1">
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors border border-white/10 backdrop-blur-sm"
                >
                  Learn more
                </button>
                <PricingModal trigger={
                  <button className="w-full py-2 bg-white text-violet-600 text-[10px] font-bold rounded-lg hover:bg-violet-50 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-black/10">
                    Upgrade plan
                    <ChevronRight className="w-3 h-3" />
                  </button>
                } />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 cursor-pointer mt-4" onClick={() => setActiveSection('settings')}>
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Account Settings</span>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between bg-sidebar-accent/50 p-1.5 rounded-xl border border-sidebar-border/30 mt-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-background shadow-sm text-amber-500' : 'text-muted-foreground hover:text-sidebar-foreground'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-sidebar-foreground'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-transparent">
          <div className="flex-1" />
          <div className="flex items-center gap-4 relative">
            {/* Search Button */}
            <button
              onClick={handleOpenSearch}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
              title="Search (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Button */}
            <button
              ref={notificationButtonRef}
              onClick={handleToggleNotifications}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              anchorRef={notificationButtonRef}
            />

            {/* Profile Button */}
            <button
              ref={profileButtonRef}
              onClick={handleToggleProfile}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[2px] cursor-pointer"
              title="Profile & Settings"
            >
              <div className="w-full h-full rounded-full bg-background p-[2px] overflow-hidden">
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* User Profile Dropdown */}
            <UserProfileDropdown
              isOpen={isProfileDropdownOpen}
              onClose={() => setIsProfileDropdownOpen(false)}
              anchorRef={profileButtonRef}
            />
          </div>
        </header>

        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          {activeSection === 'all-workspaces' && (
            <div className="max-w-7xl mx-auto space-y-12">
              {/* Create Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Create workspace</h2>
                  <p className="text-muted-foreground mt-1">Quickly create a new workspace or join an existing one.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Start from blank */}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group relative flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 h-48"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-foreground">New Workspace</span>
                    <span className="text-sm text-muted-foreground mt-1">Start from scratch</span>
                  </button>

                  {/* Join with code */}
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="group relative flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 h-48"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-foreground">Join Workspace</span>
                    <span className="text-sm text-muted-foreground mt-1">Use an invite code</span>
                  </button>

                  {/* Templates Placeholders */}
                  <div className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border opacity-60 hover:opacity-100 hover:border-border transition-all duration-300 h-48 cursor-not-allowed">
                    <div className="h-24 bg-blue-500/10 rounded-xl mb-4 w-full" />
                    <span className="font-semibold text-foreground">Agency Template</span>
                    <span className="text-xs text-muted-foreground mt-1">Coming soon</span>
                  </div>

                  <div className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border opacity-60 hover:opacity-100 hover:border-border transition-all duration-300 h-48 cursor-not-allowed">
                    <div className="h-24 bg-emerald-500/10 rounded-xl mb-4 w-full" />
                    <span className="font-semibold text-foreground">Startup Template</span>
                    <span className="text-xs text-muted-foreground mt-1">Coming soon</span>
                  </div>
                </div>
              </section>

              {/* Workspaces Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Workspaces</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {teams?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-white/10 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {teams === undefined ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/10">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layout className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No workspaces yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create one above to get started.</p>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {teams.map((team: any) => (
                      <div
                        key={team._id}
                        className={`
                                group relative bg-white dark:bg-card border border-gray-200 dark:border-white/10 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 text-left cursor-pointer
                                ${viewMode === 'grid'
                            ? 'rounded-3xl p-5 flex flex-col h-[300px] hover:-translate-y-1'
                            : 'rounded-2xl p-4 flex items-center gap-6'}
                            `}
                        onClick={() => handleEnterWorkspace(team._id)}
                      >
                        {/* Cover Image Area */}
                        <div className={`
                                relative flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 font-bold text-2xl flex-shrink-0
                                ${viewMode === 'grid' ? 'w-full h-44 mb-4' : 'w-20 h-20'}
                            `}>
                          {team.coverUrl ? (
                            <img src={team.coverUrl} alt={team.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <span className="opacity-40">{team.name.substring(0, 2).toUpperCase()}</span>
                          )}

                          {/* Top Glass Overlay for Action Menu */}
                          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Action Menu Button */}
                          {team.role === 'admin' && (
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/30">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-border/40">
                                  <DropdownMenuItem onClick={() => handleEditWorkspace(team)} className="rounded-lg gap-2">
                                    <ImageIcon className="w-4 h-4" /> Edit Workspace
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border/40" />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-white rounded-lg gap-2 focus:bg-red-500"
                                    onClick={() => {
                                      setTeamToDelete(team);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <X className="w-4 h-4" /> Delete Workspace
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-gray-900 dark:text-white truncate text-lg group-hover:text-violet-600 transition-colors duration-300">{team.name}</h3>
                            {team.description && (
                              <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{team.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <div className={cn(
                              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                              team.role === 'admin'
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                                : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                            )}>
                              {team.role === 'admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                              {team.role}
                            </div>

                            <div className="flex items-center">
                              <div className="flex -space-x-2 mr-3">
                                {team.members?.map((member: any, i: number) => (
                                  <div
                                    key={member.userId}
                                    className="relative w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
                                    style={{ zIndex: 10 - i }}
                                    title={member.fullName || member.username}
                                  >
                                    {member.avatarUrl ? (
                                      <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                                        {(member.fullName || member.username || '?').substring(0, 1)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {team.memberCount > 5 && (
                                  <div className="relative w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-0">
                                    <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400">
                                      +{team.memberCount - 5}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                {team.memberCount === 1 ? '1 member' : `${team.memberCount} members`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeSection === 'favorites' && <Favorites />}
          {activeSection === 'documentation' && <Documentation />}
          {activeSection === 'video-tutorial' && <VideoTutorial />}
          {activeSection === 'chat' && <ChatSupport />}
          {activeSection === 'community' && <Community />}
          {activeSection === 'referral' && <Referral />}
          {activeSection === 'help' && <HelpCenter />}
          {activeSection === 'settings' && <SettingsComponent />}
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Workspace"
        description="Choose a name and description for your new workspace. You can change these later in settings."
      >
        <div className="space-y-8">
          <div className="space-y-5">
            <Input
              label="Workspace Name"
              placeholder="e.g. Acme Corp, My Project"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              autoFocus
            />
            <Input
              label="Description (Optional)"
              placeholder="What's this workspace for?"
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            />
            <ImageUpload
              label="Workspace Cover"
              onUploadComplete={(storageId) => setTeamForm(prev => ({ ...prev, coverId: storageId }))}
              onClear={() => setTeamForm(prev => ({ ...prev, coverId: undefined }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="font-bold text-muted-foreground">Cancel</Button>
            <Button onClick={handleCreateTeam} loading={creating} className="min-w-[160px] font-black py-6 rounded-2xl shadow-lg shadow-violet-500/10">Create Workspace</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Workspace Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTeam(null);
          setTeamForm({ name: '', description: '', coverId: undefined });
        }}
        title="Edit Workspace"
        description="Update your workspace details or change its cover photo."
      >
        <div className="space-y-8">
          <div className="space-y-5">
            <Input
              label="Workspace Name"
              placeholder="e.g. Acme Corp, My Project"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              autoFocus
            />
            <Input
              label="Description (Optional)"
              placeholder="What's this workspace for?"
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            />
            <ImageUpload
              label="Workspace Cover"
              onUploadComplete={(storageId) => setTeamForm(prev => ({ ...prev, coverId: storageId }))}
              onClear={() => setTeamForm(prev => ({ ...prev, coverId: undefined }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="font-bold text-muted-foreground">Cancel</Button>
            <Button onClick={handleUpdateWorkspace} loading={updating} className="min-w-[160px] font-black py-6 rounded-2xl shadow-lg shadow-violet-500/10">Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-500 dark:text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{teamToDelete?.name}"</span>? This action cannot be undone and will remove access for all team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel disabled={deleting} className="rounded-2xl font-bold py-6 border-gray-200 dark:border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteWorkspace();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-2xl font-black py-6 shadow-lg shadow-red-500/20 px-8"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Workspace"
        description="Enter the 6-digit invite code provided by your team admin to access an existing workspace."
      >
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-500/10 dark:to-indigo-500/10 rounded-[28px] flex items-center justify-center mb-8 shadow-inner border border-white dark:border-white/5">
              <KeyRound className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>

            <div className="w-full max-w-sm">
              <div className="relative group">
                <Input
                  placeholder="000000"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  autoFocus
                  className="text-center text-3xl font-black tracking-[0.5em] uppercase h-20 border-2 rounded-2xl focus:ring-8 focus:ring-violet-500/10"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-5 text-center font-medium">
                Invite codes are case-sensitive and expire after 24 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setIsJoinModalOpen(false)}
              className="flex-1 font-bold py-6 rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinByCode}
              loading={joining}
              className="flex-1 font-black py-6 rounded-2xl shadow-xl shadow-violet-500/20"
              disabled={!inviteCode.trim() || inviteCode.length < 6}
            >
              Join Workspace
            </Button>
          </div>
        </div>
      </Modal>

      {/* Learn More Dialog */}
      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-md bg-card rounded-[32px] p-0 overflow-hidden shadow-2xl border-0">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-card-foreground tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              Free Plan Limits
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-2 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              You're currently on the Free plan. Here's your current usage to help you manage your resources.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">Workspaces</span>
                  <span className="text-sm font-bold text-foreground">{workspacesUsed}/{workspacesLimit}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${workspacesPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">Storage</span>
                  <span className="text-sm font-bold text-foreground">{storageUsed}MB / {storageLimit}MB</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercent}%` }}
                    className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-500" />
                Pro Features
              </h4>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  'Unlimited workspaces',
                  '10GB cloud storage',
                  'Advanced team analytics',
                  '24/7 priority support',
                  'Enhanced collaboration tools',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <PricingModal trigger={
              <Button
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-violet-600/20 mt-2"
                onClick={() => setShowLearnMore(false)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            } />
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}

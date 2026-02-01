import React, { useEffect, useState } from 'react';
import { 
  Users, ArrowRight, Plus, KeyRound, LogOut, Search, Bell, Grid, List, 
  MoreHorizontal, Layout, Star, BookOpen, MessageCircle, HelpCircle, 
  Video, MessageSquare, Heart, Image as ImageIcon, X
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// Import pages
import { Favorites } from '@/components/favorites/Favorites';
import { Documentation } from '@/components/learn/Documentation';
import { VideoTutorial } from '@/components/learn/VideoTutorial';
import { ChatSupport } from '@/components/support/ChatSupport';
import { Community } from '@/components/support/Community';
import { Referral } from '@/components/support/Referral';
import { HelpCenter } from '@/components/support/HelpCenter';

export function TeamOnboarding() {
  const { user, profile, signOut } = useAuthStore();
  const { addToast, setActiveTeamId } = useUIStore();
  const userId = user?.id || '';
  const displayName = profile?.fullName || profile?.username || user?.email?.split('@')[0] || 'User';

  const teams = useQuery(api.teams.getTeamsForUser, userId ? { userId } : 'skip');
  const createTeam = useMutation(api.teams.createTeam);
  const acceptInviteByCode = useMutation(api.teams.acceptInviteByCode);

  const [activeSection, setActiveSection] = useState('all-workspaces');
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    // Auto-select logic removed as we want the user to pick from the dashboard
  }, [teams]);

  const handleEnterWorkspace = (teamId: string) => {
    setActiveTeamId(teamId);
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
      });
      setTeamForm({ name: '', description: '' });
      setIsCreateModalOpen(false);
      setActiveTeamId(teamId as any);
      addToast({ type: 'success', title: 'Workspace created', message: 'Your new workspace is ready.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to create workspace', message: error.message });
    } finally {
      setCreating(false);
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
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === id 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <img src="/logo-black.png" alt="Vibe Vault" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl text-gray-900">Vibe Vault</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          {/* Applications Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Applications</h3>
            <div className="space-y-1">
              <SidebarItem id="all-workspaces" label="All workspaces" icon={Layout} />
              <SidebarItem id="favorites" label="Favorites" icon={Star} />
            </div>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Learn</h3>
            <div className="space-y-1">
              <SidebarItem id="documentation" label="Documentation" icon={BookOpen} />
              <SidebarItem id="video-tutorial" label="Video Tutorial" icon={Video} />
            </div>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Help and Support</h3>
            <div className="space-y-1">
              <SidebarItem id="chat" label="Chat with us" icon={MessageCircle} />
              <SidebarItem id="community" label="Community" icon={Users} />
              <SidebarItem id="referral" label="Refer a friend" icon={Heart} />
              <SidebarItem id="help" label="Help" icon={HelpCircle} />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} alt="Avatar" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">Sign Out</p>
            </div>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-transparent">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[2px] cursor-pointer">
              <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 pb-8 overflow-y-auto">
            {activeSection === 'all-workspaces' && (
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Create Section */}
                    <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create workspace</h2>
                        <p className="text-gray-500 mt-1">Quickly create a new workspace or join an existing one.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Start from blank */}
                        <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 hover:border-violet-500 hover:bg-violet-50/50 transition-all duration-300 h-48"
                        >
                        <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-gray-900">New Workspace</span>
                        <span className="text-sm text-gray-500 mt-1">Start from scratch</span>
                        </button>

                        {/* Join with code */}
                        <button 
                        onClick={() => setIsJoinModalOpen(true)}
                        className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 h-48"
                        >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-gray-900">Join Workspace</span>
                        <span className="text-sm text-gray-500 mt-1">Use an invite code</span>
                        </button>

                        {/* Templates Placeholders */}
                        <div className="group relative flex flex-col p-6 bg-white rounded-2xl border border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300 transition-all duration-300 h-48 cursor-not-allowed">
                        <div className="h-24 bg-blue-50 rounded-xl mb-4 w-full" />
                        <span className="font-semibold text-gray-900">Agency Template</span>
                        <span className="text-xs text-gray-400 mt-1">Coming soon</span>
                        </div>
                        
                        <div className="group relative flex flex-col p-6 bg-white rounded-2xl border border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300 transition-all duration-300 h-48 cursor-not-allowed">
                        <div className="h-24 bg-emerald-50 rounded-xl mb-4 w-full" />
                        <span className="font-semibold text-gray-900">Startup Template</span>
                        <span className="text-xs text-gray-400 mt-1">Coming soon</span>
                        </div>
                    </div>
                    </section>

                    {/* Workspaces Section */}
                    <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Your Workspaces</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {teams?.length || 0}
                        </span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
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
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layout className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No workspaces yet</h3>
                        <p className="text-gray-500 mt-1">Create one above to get started.</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {teams.map((team: any) => (
                            <button
                            key={team._id}
                            onClick={() => handleEnterWorkspace(team._id)}
                            className={`
                                group relative bg-white border border-gray-200 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 text-left
                                ${viewMode === 'grid' ? 'rounded-2xl p-6 flex flex-col h-56' : 'rounded-xl p-4 flex items-center gap-6'}
                            `}
                            >
                            <div className={`
                                flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 font-bold text-xl
                                ${viewMode === 'grid' ? 'w-full h-32 mb-4' : 'w-16 h-16 flex-shrink-0'}
                            `}>
                                {team.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate mb-1">{team.name}</h3>
                                {team.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                    Admin
                                </span>
                                </div>
                            </div>
                            </button>
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
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Workspace"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
            <Input
              placeholder="e.g. Acme Corp, My Project"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <Input
              placeholder="What's this workspace for?"
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} loading={creating}>Create Workspace</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Workspace"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
            <Input
              placeholder="Enter the 6-digit code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">Ask your team admin for the invite code.</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
            <Button onClick={handleJoinByCode} loading={joining}>Join Workspace</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

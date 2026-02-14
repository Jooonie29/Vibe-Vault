import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, Mail, ArrowLeft, Copy, Check, Send, User } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';


export function InviteModal() {
  const { activeModal, closeModal, activeTeamId, addToast } = useUIStore();
  const { user } = useAuthStore();
  const isOpen = activeModal === 'invite-member';
  const [view, setView] = useState<'menu' | 'invite-code' | 'email-invite' | 'success'>('menu');
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [suggestionsStyle, setSuggestionsStyle] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const getOrCreateInviteCode = useMutation(api.teams.getOrCreateInviteCode);
  const inviteMember = useMutation(api.teams.inviteMember);

  // Using useQuery for search would be reactive. Let's use useQuery.
  const [debouncedEmail, setDebouncedEmail] = useState(email);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(email);
    }, 300);
    return () => clearTimeout(handler);
  }, [email]);
  const usersQuery = useQuery(api.profiles.searchUsers, { query: debouncedEmail });

  const filteredUsers = useMemo(() => {
    const users = usersQuery || [];
    return users.filter((u: any) => typeof u?.email === 'string' && u.email.trim().length > 0);
  }, [usersQuery]);

  useEffect(() => {
    const shouldShow = email.trim().length >= 2 && filteredUsers.length > 0;
    setSearchResults(filteredUsers);
    setShowSuggestions(shouldShow);
  }, [filteredUsers, email]);

  useEffect(() => {
    if (!showSuggestions) return;
    const el = emailInputRef.current;
    if (!el) return;

    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      setSuggestionsStyle({
        top: Math.round(rect.bottom + 4),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showSuggestions]);

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inputEl = emailInputRef.current;
      const suggestionsEl = suggestionsRef.current;
      if (!inputEl) return;

      if (inputEl.contains(target)) return;
      if (suggestionsEl && suggestionsEl.contains(target)) return;
      setShowSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  useEffect(() => {
    if (!isOpen) {
      setView('menu');
      setCopied(false);
      setCode(null);
      setEmail('');
    }
  }, [isOpen]);

  const fetchCode = async () => {
    if (!activeTeamId || !user) return;
    if (code) return;

    setLoading(true);
    try {
      const inviteCode = await getOrCreateInviteCode({
        userId: user.id,
        teamId: activeTeamId as any,
      });
      setCode(inviteCode);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Error', message: 'Failed to generate invite code' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView: 'invite-code' | 'email-invite') => {
    setView(newView);
    if (newView === 'invite-code') {
      fetchCode();
    }
  };

  const handleSendInvite = async () => {
    if (!activeTeamId || !user || !email?.trim()) return;

    setInviteLoading(true);
    try {
      await inviteMember({
        userId: user.id,
        teamId: activeTeamId as any,
        email: email.trim(),
        role: 'member',
      });
      // Success handling
      setInvitedEmail(email);
      setEmail('');
      setView('success');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to send invite', message: error.message });
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ type: 'success', title: 'Copied', message: 'Invite code copied to clipboard' });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal} title="Invite Team Members" size="md">
        <div className="px-6 pb-6 pt-2">
          {view === 'menu' && (
            <>
              <p className="text-muted-foreground text-center mb-8">
                Choose how you'd like to invite new members to your workspace.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleViewChange('invite-code')}
                  className="flex flex-col items-center justify-center p-6 bg-card hover:bg-primary/5 border-2 border-dashed border-border hover:border-primary rounded-2xl transition-all group h-40"
                >
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-primary">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Invite Code</h3>
                  <p className="text-xs text-center text-muted-foreground">Share a unique code</p>
                </button>

                <button
                  onClick={() => handleViewChange('email-invite')}
                  className="flex flex-col items-center justify-center p-6 bg-card hover:bg-primary/5 border-2 border-dashed border-border hover:border-primary rounded-2xl transition-all group h-40"
                >
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Email Invite</h3>
                  <p className="text-xs text-center text-muted-foreground">Send invitation to email</p>
                </button>
              </div>
            </>
          )}

          {view === 'invite-code' && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setView('menu')}
                className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Workspace Invite Code</h3>
                <p className="text-muted-foreground text-sm">
                  Share this code with your team members to let them join this workspace.
                </p>
              </div>

              {loading ? (
                <div className="h-16 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="w-full max-w-sm space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-xl border border-border">
                    <code className="flex-1 text-center text-2xl font-mono font-bold tracking-wider text-primary">
                      {code}
                    </code>
                  </div>

                  <Button
                    onClick={copyToClipboard}
                    className="w-full"
                    variant="outline"
                    disabled={!code}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {view === 'email-invite' && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setView('menu')}
                className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">Invite by Email</h3>
                <p className="text-muted-foreground text-sm">
                  Send an invitation directly to your team member's email address.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-4 relative">
                <div className="relative">
                  <Input
                    label="Email Address"
                    placeholder="colleague@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    autoComplete="off"
                    ref={emailInputRef}
                  />
                </div>

                <Button
                  onClick={handleSendInvite}
                  className="w-full"
                  loading={inviteLoading}
                  disabled={!email?.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </div>
          )}

          {view === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Invitation Sent!</h3>
              <p className="text-muted-foreground text-sm text-center mb-6">
                We've sent an invitation to <strong className="text-foreground">{invitedEmail}</strong>.
              </p>
              <Button onClick={() => setView('menu')} className="w-full">
                Invite Another Member
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <InviteSuggestionsPortal
        isOpen={isOpen && view === 'email-invite' && showSuggestions}
        style={suggestionsStyle}
        results={searchResults}
        onSelect={(nextEmail) => {
          setEmail(nextEmail || '');
          setShowSuggestions(false);
        }}
        suggestionsRef={suggestionsRef}
      />
    </>
  );
}

function InviteSuggestionsPortal({
  isOpen,
  style,
  results,
  onSelect,
  suggestionsRef,
}: {
  isOpen: boolean;
  style: { top: number; left: number; width: number };
  results: any[];
  onSelect: (email: string) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}) {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={suggestionsRef}
      style={{ position: 'fixed', top: style.top, left: style.left, width: style.width }}
      className="bg-popover border border-border rounded-xl shadow-lg z-[60] max-h-60 overflow-y-auto"
    >
      {results.map((user) => (
        <button
          key={user.userId}
          type="button"
          className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left transition-colors min-h-[64px]"
          onClick={() => onSelect(user.email)}
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.fullName || user.username || 'User'}</p>
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
}

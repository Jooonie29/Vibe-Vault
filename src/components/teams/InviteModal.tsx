import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, QrCode, ArrowLeft, Copy, Check, X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';

export function InviteModal() {
  const { activeModal, closeModal, activeTeamId, addToast } = useUIStore();
  const { user } = useAuthStore();
  const isOpen = activeModal === 'invite-member';
  const [view, setView] = useState<'menu' | 'invite-code' | 'qr-code'>('menu');
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const getOrCreateInviteCode = useMutation(api.teams.getOrCreateInviteCode);

  useEffect(() => {
    if (!isOpen) {
      setView('menu');
      setCopied(false);
      setCode(null);
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

  const handleViewChange = (newView: 'invite-code' | 'qr-code') => {
    setView(newView);
    fetchCode();
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
    <Modal isOpen={isOpen} onClose={closeModal} title="Invite Team Members" size="md">
      <div className="p-6">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
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
                onClick={() => handleViewChange('qr-code')}
                className="flex flex-col items-center justify-center p-6 bg-card hover:bg-primary/5 border-2 border-dashed border-border hover:border-primary rounded-2xl transition-all group h-40"
              >
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-primary">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-1">QR Code</h3>
                <p className="text-xs text-center text-muted-foreground">Scan to join</p>
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

        {view === 'qr-code' && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setView('menu')}
              className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Scan to Join</h3>
              <p className="text-muted-foreground text-sm">
                Team members can scan this QR code to join immediately.
              </p>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              code && (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-border mb-6">
                    <QRCodeSVG 
                      value={`${window.location.origin}?invite=${code}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    This QR code contains the invite code <strong className="font-mono">{code}</strong>
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

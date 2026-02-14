import React, { useState, useMemo } from 'react';
import { useProjects, useUpdateProjectStatus } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { KanbanBoardUI } from './KanbanBoardUI';
import { DropResult } from '@hello-pangea/dnd';
import { ProjectStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2 } from "lucide-react";

export function KanbanBoard() {
  const { data: projects, isLoading } = useProjects();
  const updateStatus = useUpdateProjectStatus();
  const { openModal, activeTeamId } = useUIStore();
  const { user, profile } = useAuthStore();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isPro = Boolean(profile?.proTrialEndsAt && profile.proTrialEndsAt > Date.now());

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ProjectStatus;

    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <>
      <KanbanBoardUI
        projects={projects || []}
        onDragEnd={handleDragEnd}
        onAddProject={() => openModal('project')}
        onAddNote={(p) => openModal('project-note', p)}
        onOpenProject={(p) => openModal('project-view', p)}
        onOpenUpdates={() => openModal('project-updates')}
        onShareBoard={() => setIsShareModalOpen(true)}
        isPro={isPro}
      />

      {user && (
        <BoardShareModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          userId={user.id}
          teamId={activeTeamId as Id<"teams"> || undefined}
        />
      )}
    </>
  );
}

function BoardShareModal({ open, onOpenChange, userId, teamId }: { open: boolean; onOpenChange: (open: boolean) => void; userId: string; teamId?: Id<"teams"> }) {
  const share = useQuery(api.boardShares.getBoardShare, { userId, teamId });
  const createShare = useMutation(api.boardShares.createBoardShare);
  const updateShare = useMutation(api.boardShares.updateBoardShare);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleShare = async (enabled: boolean) => {
    if (!share) {
      // Create new share
      setIsGenerating(true);
      try {
        await createShare({ userId, teamId });
        toast.success("Board sharing enabled");
      } catch (error) {
        toast.error("Failed to enable sharing");
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      // ... (rest of the else block is verifying updateShare call which doesn't need teamId)
      // Update existing
      try {
        await updateShare({ userId, shareId: share._id, enabled });
        toast.success(enabled ? "Board sharing enabled" : "Board sharing disabled");
      } catch (error) {
        toast.error("Failed to update sharing");
        console.error(error);
      }
    }
  };

  const copyLink = () => {
    if (!share?.token) return;
    const url = `${window.location.origin}/share/board/${share.token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const regenerateLink = async () => {
    if (!share) return;
    if (confirm("This will invalidate the old link. Are you sure?")) {
      // Technically I didn't implement regenerate in backend, but creating a new one with same userId logic in createBoardShare 
      // checks for existing. To regenerate, I'd need to delete old or update token.
      // For now, let's skip regenerate or implement it later if needed.
      // I'll just show a toast "Not implemented yet" or remove the button.
      // Actually, let's remove it for simplicity as per instructions "don't create files unless necessary", 
      // I want to keep backend simple.
      toast.info("Regenerate link not available yet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card rounded-[32px] p-0 overflow-hidden shadow-2xl border-0">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">Share Project Board</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Anyone with the link can view this board and all its projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-8 pt-2">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Public Link</Label>
              <p className="text-sm text-muted-foreground">
                Allow access via a unique link
              </p>
            </div>
            <Switch
              checked={share?.enabled ?? false}
              onCheckedChange={handleToggleShare}
              disabled={isGenerating}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>

          {share?.enabled && (
            <div className="flex items-center space-x-3">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={`${window.location.origin}/share/board/${share.token}`}
                  readOnly
                  className="h-12 rounded-xl bg-muted/50 border-border text-muted-foreground font-medium"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/40 hover:text-violet-700 dark:hover:text-violet-300 shadow-none p-0 flex items-center justify-center"
                onClick={copyLink}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

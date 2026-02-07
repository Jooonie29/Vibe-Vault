import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export interface TeamMember {
  id: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  profile?: {
    userId: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export function useTeamMembers() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();

  const members = useQuery(
    api.teams.getTeamMembers,
    activeTeamId ? { teamId: activeTeamId as any } : 'skip'
  );

  return {
    data: (members as any[] | undefined)?.map((member) => ({
      ...member,
      id: member._id,
    })) as TeamMember[] | undefined,
    isLoading: members === undefined && !!activeTeamId,
    error: null,
  };
}

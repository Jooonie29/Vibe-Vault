import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCallback } from 'react';

export interface Conversation {
  _id: string;
  _creationTime: number;
  teamId: string;
  participantIds: string[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessageAt: number;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  unreadCount: number;
  participants: {
    userId: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
  }[];
}

export interface Message {
  _id: string;
  _creationTime: number;
  conversationId: string;
  senderId: string;
  text: string;
  attachments?: {
    type: string;
    url: string;
    name?: string;
    storageId: string;
  }[];
  // Deprecated fields kept for backward compatibility
  attachmentId?: string;
  attachmentType?: string;
  attachmentUrl?: string;
  replyToId?: string;
  editedAt?: number;
  deletedAt?: number;
  sender: {
    userId: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface TeamMember {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

export function useConversations() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();

  const conversations = useQuery(
    api.messages.getConversations,
    activeTeamId && user ? { teamId: activeTeamId as any, userId: user.id } : 'skip'
  );

  return {
    data: conversations as Conversation[] | undefined,
    isLoading: conversations === undefined && !!activeTeamId && !!user,
  };
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuthStore();

  const messages = useQuery(
    api.messages.getMessages,
    conversationId && user ? { conversationId: conversationId as any, userId: user.id, limit: 50 } : 'skip'
  );

  return {
    data: messages as Message[] | undefined,
    isLoading: messages === undefined && !!conversationId && !!user,
  };
}

export function useSendMessage() {
  const { user } = useAuthStore();
  const sendMessageMutation = useMutation(api.messages.sendMessage);

  return useCallback(
    async (
      conversationId: string, 
      text: string, 
      replyToId?: string, 
      attachments?: { type: string, storageId: string, name?: string }[]
    ) => {
      if (!user) throw new Error('Not authenticated');
      await sendMessageMutation({
        conversationId: conversationId as any,
        userId: user.id,
        text,
        replyToId: replyToId as any,
        attachments,
      });
    },
    [sendMessageMutation, user]
  );
}

export function useMarkAsRead() {
  const { user } = useAuthStore();
  const markAsReadMutation = useMutation(api.messages.markAsRead);

  return useCallback(
    async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');
      await markAsReadMutation({
        conversationId: conversationId as any,
        userId: user.id,
      });
    },
    [markAsReadMutation, user]
  );
}

export function useGetOrCreateDirectConversation() {
  const { user } = useAuthStore();
  const getOrCreateMutation = useMutation(api.messages.getOrCreateDirectConversation);

  return useCallback(
    async (teamId: string, otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      const conversationId = await getOrCreateMutation({
        teamId: teamId as any,
        userId: user.id,
        otherUserId,
      });
      return conversationId;
    },
    [getOrCreateMutation, user]
  );
}

export function useCreateGroupConversation() {
  const { user } = useAuthStore();
  const createGroupMutation = useMutation(api.messages.createGroupConversation);

  return useCallback(
    async (teamId: string, participantIds: string[], groupName: string) => {
      if (!user) throw new Error('Not authenticated');
      const conversationId = await createGroupMutation({
        teamId: teamId as any,
        userId: user.id,
        participantIds,
        groupName,
      });
      return conversationId;
    },
    [createGroupMutation, user]
  );
}

export function useAvailableTeamMembers() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();

  const members = useQuery(
    api.messages.getAvailableTeamMembers,
    activeTeamId && user ? { teamId: activeTeamId as any, userId: user.id } : 'skip'
  );

  return {
    data: members as TeamMember[] | undefined,
    isLoading: members === undefined && !!activeTeamId && !!user,
  };
}

export function useEditMessage() {
  const { user } = useAuthStore();
  const editMutation = useMutation(api.messages.editMessage);

  return useCallback(
    async (messageId: string, text: string) => {
      if (!user) throw new Error('Not authenticated');
      await editMutation({
        messageId: messageId as any,
        userId: user.id,
        text,
      });
    },
    [editMutation, user]
  );
}

export function useDeleteMessage() {
  const { user } = useAuthStore();
  const deleteMutation = useMutation(api.messages.deleteMessage);

  return useCallback(
    async (messageId: string) => {
      if (!user) throw new Error('Not authenticated');
      await deleteMutation({
        messageId: messageId as any,
        userId: user.id,
      });
    },
    [deleteMutation, user]
  );
}

export function useDeleteConversation() {
  const { user } = useAuthStore();
  const deleteMutation = useMutation(api.messages.deleteConversation);

  return useCallback(
    async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');
      await deleteMutation({
        conversationId: conversationId as any,
        userId: user.id,
      });
    },
    [deleteMutation, user]
  );
}

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Item, ItemType, Tag } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function useItems(type?: ItemType) {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();
  const userId = user?.id || "";

  const items = useQuery(api.items.getItems, {
    userId,
    teamId: activeTeamId ? (activeTeamId as any) : undefined,
    type
  });

  return {
    data: (items as any[])?.map(item => ({ ...item, id: item._id })),
    isLoading: items === undefined,
    error: null,
  };
}

export function useItem(id: string | null) {
  const { user } = useAuthStore();
  const userId = user?.id || "";

  const item = useQuery(api.items.getItem, {
    id: id as any,
    userId
  });

  return {
    data: item ? { ...(item as any), id: (item as any)._id } : undefined,
    isLoading: item === undefined,
    error: null,
  };
}

export function useCreateItem() {
  const createItemMutation = useMutation(api.items.createItem);
  const { user } = useAuthStore();
  const { addToast, activeTeamId } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (item: Partial<Item>) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);
    try {
      const id = await createItemMutation({
        userId: user.id,
        teamId: activeTeamId ? (activeTeamId as any) : undefined,
        type: item.type as any,
        title: item.title || "Untitled",
        description: item.description || undefined,
        content: item.content || undefined,
        language: item.language || undefined,
        category: item.category || undefined,
        fileUrl: item.fileUrl || undefined,
        fileType: item.fileType || undefined,
        fileSize: item.fileSize || undefined,
        metadata: item.metadata || {},
        isFavorite: item.isFavorite || false,
      });

      addToast({
        type: 'success',
        title: 'Item created',
        message: `${item.title} has been created successfully.`,
      });

      return { id };
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error creating item',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useUpdateItem() {
  const updateItemMutation = useMutation(api.items.updateItem);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ id, updates }: { id: string; updates: Partial<Item> }) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);
    try {
      await updateItemMutation({
        id: id as any,
        userId: user.id,
        updates: {
          title: updates.title,
          description: updates.description || undefined,
          content: updates.content || undefined,
          language: updates.language || undefined,
          category: updates.category || undefined,
          fileUrl: updates.fileUrl || undefined,
          fileType: updates.fileType || undefined,
          fileSize: updates.fileSize || undefined,
          metadata: updates.metadata,
          isFavorite: updates.isFavorite,
        },
      });

      addToast({
        type: 'success',
        title: 'Item updated',
        message: `${updates.title || 'Item'} has been updated.`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error updating item',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useDeleteItem() {
  const deleteItemMutation = useMutation(api.items.deleteItem);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);
    try {
      await deleteItemMutation({ id: id as any, userId: user.id });
      addToast({
        type: 'success',
        title: 'Item deleted',
        message: 'The item has been permanently deleted.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error deleting item',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useToggleFavorite() {
  const updateItemMutation = useMutation(api.items.updateItem);
  const { user } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);
    try {
      await updateItemMutation({
        id: id as any,
        userId: user.id,
        updates: { isFavorite },
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useStats() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();
  const userId = user?.id || "";

  const stats = useQuery(api.items.getStats, { userId, teamId: activeTeamId ? (activeTeamId as any) : undefined });

  return {
    data: stats,
    isLoading: stats === undefined,
    error: null,
  };
}

export function useTags() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();
  const userId = user?.id || "";

  const tags = useQuery(api.tags.getTags, { userId, teamId: activeTeamId ? (activeTeamId as any) : undefined });

  return {
    data: (tags as any[] | undefined)?.map(tag => ({ ...tag, id: tag._id })),
    isLoading: tags === undefined,
    error: null,
  };
}

export function useCreateTag() {
  const createTagMutation = useMutation(api.tags.createTag);
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ name, color }: { name: string; color?: string }) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);
    try {
      return await createTagMutation({
        userId: user.id,
        teamId: activeTeamId ? (activeTeamId as any) : undefined,
        name,
        color: color || '#6366F1',
      });
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

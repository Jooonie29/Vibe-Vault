import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Project, ProjectStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function useProjects() {
  const { user } = useAuthStore();
  const { activeTeamId } = useUIStore();
  const userId = user?.id || "";

  const projects = useQuery(api.projects.getProjects, { 
    userId,
    teamId: (activeTeamId as Id<"teams">) || undefined 
  });

  return {
    data: (projects as any[] | undefined)
      ?.filter(p => !p.isArchived)
      .map(p => ({ ...p, id: p._id })),
    isLoading: projects === undefined,
    error: null,
  };
}

export function useCreateProject() {
  const createProjectMutation = useMutation(api.projects.createProject);
  const { user } = useAuthStore();
  const { addToast, activeTeamId } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (project: Partial<Project>) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);

    try {
      const id = await createProjectMutation({
        userId: user.id,
        teamId: (activeTeamId as Id<"teams">) || undefined,
        title: project.title || "Untitled Project",
        description: project.description || undefined,
        status: project.status || "ideation",
        progress: project.progress || 0,
        dueDate: project.dueDate || undefined,
        priority: project.priority || "medium",
        color: project.color || "#6366F1",
        isArchived: project.isArchived || false,
        notes: project.notes || undefined,
      });

      addToast({
        type: 'success',
        title: 'Project created',
        message: `${project.title} has been added to your board.`,
      });

      return { id };
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error creating project',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useUpdateProject() {
  const { activeTeamId } = useUIStore();
  const updateProjectMutation = useMutation(api.projects.updateProject).withOptimisticUpdate((localStore, args) => {
    const { id, updates, userId } = args;
    const projects = localStore.getQuery(api.projects.getProjects, { 
      userId,
      teamId: (activeTeamId as Id<"teams">) || undefined
    });
    if (projects !== undefined) {
      const newProjects = projects.map((p) =>
        p._id === id ? { ...p, ...updates } : p
      );
      localStore.setQuery(api.projects.getProjects, { 
        userId,
        teamId: (activeTeamId as Id<"teams">) || undefined
      }, newProjects);
    }
  });
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);

    try {
      await updateProjectMutation({
        id: id as any,
        userId: user.id,
        updates: {
          title: updates.title,
          description: updates.description || undefined,
          status: updates.status,
          progress: updates.progress,
          dueDate: updates.dueDate || undefined,
          priority: updates.priority,
          color: updates.color,
          isArchived: updates.isArchived,
          notes: updates.notes,
        },
      });

      addToast({
        type: 'success',
        title: 'Project updated',
        message: `${updates.title || 'Project'} has been updated.`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error updating project',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useUpdateProjectStatus() {
  const { activeTeamId } = useUIStore();
  const updateProjectMutation = useMutation(api.projects.updateProject).withOptimisticUpdate((localStore, args) => {
    const { id, updates, userId } = args;
    const projects = localStore.getQuery(api.projects.getProjects, { 
      userId,
      teamId: (activeTeamId as Id<"teams">) || undefined
    });
    if (projects !== undefined) {
      const newProjects = projects.map((p) =>
        p._id === id ? { ...p, ...updates } : p
      );
      localStore.setQuery(api.projects.getProjects, { 
        userId,
        teamId: (activeTeamId as Id<"teams">) || undefined
      }, newProjects);
    }
  });
  const { user } = useAuthStore();

  const mutate = async ({ id, status }: { id: string; status: ProjectStatus }) => {
    if (!user) throw new Error('Not authenticated');
    await updateProjectMutation({
      id: id as any,
      userId: user.id,
      updates: { status },
    });
  };

  return { mutate, mutateAsync: mutate };
}

export function useDeleteProject() {
  const deleteProjectMutation = useMutation(api.projects.deleteProject);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    setIsPending(true);

    try {
      await deleteProjectMutation({ id: id as any, userId: user.id });
      addToast({
        type: 'success',
        title: 'Project deleted',
        message: 'The project has been permanently deleted.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error deleting project',
        message: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, mutateAsync: mutate, isPending };
}

export function useArchiveProject() {
  const updateProjectMutation = useMutation(api.projects.updateProject);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const mutate = async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await updateProjectMutation({
        id: id as any,
        userId: user.id,
        updates: { isArchived: true },
      });

      addToast({
        type: 'success',
        title: 'Project archived',
        message: `Project has been archived.`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error archiving project',
        message: error.message,
      });
      throw error;
    }
  };

  return { mutate, mutateAsync: mutate };
}

// Type definitions for Vault Vibe
// Note: These interfaces are mapped from Convex types which use camelCase
// and include automatic _id and _creationTime fields.

export interface Profile {
  id: string; // Used locally, maps to _id
  userId: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  referralCode?: string;
  referredBy?: string;
  proTrialEndsAt?: number;
  _creationTime: number;
}

export interface Item {
  id: string; // Maps to _id
  userId: string;
  type: 'code' | 'prompt' | 'file';
  title: string;
  description?: string;
  content?: string;
  language?: string;
  category?: string;
  fileUrl?: string;
  storageId?: string;
  fileType?: string;
  fileSize?: number;
  metadata: Record<string, any>;
  isFavorite: boolean;
  _creationTime: number;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  _creationTime: number;
}

export interface ItemTag {
  itemId: string;
  tagId: string;
}

export interface Project {
  id: string;
  userId: string;
  teamId?: string;
  title: string;
  description?: string;
  status: 'ideation' | 'planning' | 'in_progress' | 'completed';
  progress: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
  isArchived: boolean;
  notes?: string;
  noteUpdatedAt?: number;
  _creationTime: number;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  teamId?: string;
  authorId: string;
  type: 'created' | 'updated' | 'deleted' | 'note';
  summary: string;
  changes?: Record<string, any>;
  _creationTime: number;
}

export type ItemType = 'code' | 'prompt' | 'file';
export type ProjectStatus = 'ideation' | 'planning' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface Stats {
  snippets: number;
  prompts: number;
  files: number;
  projects: number;
}

export interface ActivityItem {
  id: string;
  type: ItemType | 'project';
  title: string;
  action: 'created' | 'updated' | 'deleted';
  timestamp: string;
}

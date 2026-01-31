import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Flag } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { Project, ProjectStatus, Priority } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

const statusOptions = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

const colorOptions = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
];

export function ProjectModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ideation' as ProjectStatus,
    priority: 'medium' as Priority,
    progress: 0,
    dueDate: '',
    color: '#6366F1',
    isArchived: false,
  });

  const isOpen = activeModal === 'project';
  const isEditing = !!(modalData && (modalData as any).id);
  const existingProject = isEditing ? modalData as Project : null;

  useEffect(() => {
    if (existingProject) {
      setFormData({
        title: existingProject.title,
        description: existingProject.description || '',
        status: existingProject.status,
        priority: existingProject.priority,
        progress: existingProject.progress,
        dueDate: existingProject.dueDate || '',
        color: existingProject.color,
        isArchived: existingProject.isArchived || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: (modalData?.status as ProjectStatus) || 'ideation',
        priority: 'medium',
        progress: 0,
        dueDate: '',
        color: '#6366F1',
        isArchived: false,
      });
    }
    setConfirmDelete(false);
  }, [existingProject, isOpen, modalData]);

  const handleClose = () => {
    closeModal();
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      addToast({ type: 'error', title: 'Title required', message: 'Please enter a project title.' });
      return;
    }

    const projectData = {
      ...formData,
      dueDate: formData.dueDate || undefined,
    };

    if (isEditing && existingProject) {
      await updateProject.mutateAsync({
        id: existingProject.id,
        updates: projectData,
      });
    } else {
      await createProject.mutateAsync(projectData);
    }
    handleClose();
  };

  const handleDelete = async () => {
    if (!existingProject) return;
    await deleteProject.mutateAsync(existingProject.id);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Edit Project' : 'New Project'} size="md">
      <div className="p-6 space-y-4">
        <Input
          label="Project Title"
          placeholder="My Awesome App"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Textarea
          label="Description"
          placeholder="What's this project about?"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Progress: {formData.progress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          icon={<Calendar className="w-5 h-5" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''
                  }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        {isEditing && existingProject ? (
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Delete this project?</span>
              <Button size="sm" variant="danger" onClick={handleDelete} loading={deleteProject.isPending}>
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          )
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={createProject.isPending || updateProject.isPending}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal >
  );
}

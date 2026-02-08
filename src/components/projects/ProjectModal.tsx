import { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Layout, FolderKanban, Check, Clock } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { Project, ProjectStatus, Priority } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" noPadding>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between bg-card sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-violet-100 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-bold bg-muted/50">
                  Project
                </Badge>
                {existingProject && (
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && existingProject && (
              confirmDelete ? (
                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-1 rounded-xl border border-red-100 dark:border-red-800">
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                    title="Confirm Delete"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5 overflow-y-auto custom-scrollbar">
          <Input
            label="Project Title"
            placeholder="My Awesome App"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="What's this project about? Goals, scope, etc."
            rows={2}
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

          <div className="bg-muted/50 p-4 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground tracking-tight">Project Progress</label>
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{formData.progress}%</span>
            </div>
            <div className="relative h-5 w-full bg-card rounded-full overflow-hidden shadow-inner border border-border p-0.5">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${formData.progress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
              <span>Not Started</span>
              <span>Halfway</span>
              <span>Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              icon={<Calendar className="w-4 h-4" />}
            />

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-xl transition-all shadow-sm flex items-center justify-center border-2 ${formData.color === color
                        ? 'border-card ring-2 ring-violet-500/20 scale-105 shadow-md z-10'
                        : 'border-transparent hover:scale-105 hover:shadow-md'
                      }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3 mt-auto">
          <Button variant="ghost" onClick={handleClose} className="text-muted-foreground font-medium hover:text-foreground transition-colors text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={createProject.isPending || updateProject.isPending}
            icon={<Save className="w-3.5 h-3.5" />}
            className="px-5 py-2 rounded-xl shadow-lg shadow-violet-500/10 font-bold text-sm"
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal >
  );
}

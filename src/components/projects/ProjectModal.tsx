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
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-violet-100 bg-violet-50 text-violet-600 shadow-sm">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-bold bg-white">
                  Project
                </Badge>
                {existingProject && (
                   <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     Tracking
                   </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing && existingProject && (
              confirmDelete ? (
                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100">
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                    title="Confirm Delete"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
                  title="Delete Project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )
            )}
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
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
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-6">
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

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Project Progress</label>
              <span className="text-sm font-bold text-violet-600">{formData.progress}%</span>
            </div>
            <div className="relative h-4 w-full bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300"
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
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Not Started</span>
              <span>Halfway</span>
              <span>Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              icon={<Calendar className="w-5 h-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-9 h-9 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                      formData.color === color 
                        ? 'ring-2 ring-offset-2 ring-gray-300 scale-110 shadow-md' 
                        : 'hover:scale-110 hover:shadow-md'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && <Check className="w-5 h-5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 mt-auto">
          <Button variant="ghost" onClick={handleClose} className="text-gray-500 hover:text-gray-900">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={createProject.isPending || updateProject.isPending}
            icon={<Save className="w-4 h-4" />}
            className="shadow-lg shadow-violet-500/20"
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal >
  );
}

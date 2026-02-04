import { motion } from 'framer-motion';
import {
    Calendar,
    Flag,
    FileText,
    Edit2,
    Clock,
    CheckCircle2,
    Plus,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Project } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { format, isPast, isToday, isValid } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Trash2, Save, X } from 'lucide-react';

const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
};

const statusConfig = {
    ideation: { icon: Clock, label: 'Ideation', color: 'text-amber-500', bg: 'bg-amber-50' },
    planning: { icon: Clock, label: 'Planning', color: 'text-blue-500', bg: 'bg-blue-50' },
    in_progress: { icon: Clock, label: 'In Progress', color: 'text-violet-500', bg: 'bg-violet-50' },
    completed: { icon: CheckCircle2, label: 'Completed', color: 'text-green-500', bg: 'bg-green-50' },
};

import { Id } from '../../../convex/_generated/dataModel';

export function ProjectViewModal() {
    const { user } = useAuthStore();
    const { activeModal, modalData, closeModal, openModal, addToast } = useUIStore();

    const project = modalData as Project | null;

    const isOpen = activeModal === 'project-view';
    const projectId = project?.id as Id<"projects">;
    const userId = user?.id || '';

    const deleteNote = useMutation(api.projects.deleteProjectNote);
    const editNote = useMutation(api.projects.editProjectNote);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const handleEditStart = (noteId: string, content: string) => {
        setEditingNoteId(noteId);
        setEditContent(content.replace(/<[^>]*>/g, '')); // Simple text for now, or keep HTML if using rich text
    };

    const handleEditSave = async (noteId: string) => {
        if (!project) return;
        try {
            await editNote({
                id: noteId as Id<"projectUpdates">,
                projectId: project.id,
                userId,
                newContent: editContent
            });
            setEditingNoteId(null);
            addToast({ type: 'success', title: 'Note updated', message: 'Note history updated successfully.' });
        } catch (e) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to update note.' });
        }
    };

    const handleDelete = async (noteId: string) => {
        if (!project || !window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteNote({
                id: noteId as Id<"projectUpdates">,
                projectId: project.id,
                userId
            });
            addToast({ type: 'success', title: 'Note deleted', message: 'Note removed from history.' });
        } catch (e) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to delete note.' });
        }
    };

    // Fetch last 5 project notes
    const projectNotes = useQuery(api.projects.getProjectUpdates,
        project ? {
            userId,
            projectId,
            type: 'note',
            limit: 5
        } : "skip"
    );

    if (!project) return null;

    const currentStatusConfig = project.status ? statusConfig[project.status] : statusConfig.ideation;
    const StatusIcon = currentStatusConfig.icon;
    const priorityColor = project.priority ? priorityColors[project.priority] : priorityColors.medium;
    const progress = typeof project.progress === 'number' ? project.progress : 0;

    const dueDate = project.dueDate ? new Date(project.dueDate) : null;
    const hasValidDueDate = dueDate ? isValid(dueDate) : false;
    const dueDateStatus = hasValidDueDate
        ? isPast(dueDate as Date) && !isToday(dueDate as Date)
            ? 'overdue'
            : isToday(dueDate as Date)
                ? 'today'
                : 'upcoming'
        : null;
    const createdAt = project._creationTime ? new Date(project._creationTime) : null;
    const hasValidCreatedAt = createdAt ? isValid(createdAt) : false;

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Project Overview"
            size="md"
        >
            <div className="flex flex-col h-full bg-white">
                <div className="p-0 overflow-y-auto max-h-[80vh]">
                    {/* Main Content Area */}
                    <div className="p-8 space-y-8">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={priorityColor} size="sm">
                                        <Flag className="w-3 h-3 mr-1" />
                                        {project.priority}
                                    </Badge>
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${currentStatusConfig.bg} ${currentStatusConfig.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {currentStatusConfig.label}
                                    </div>
                                </div>

                                {/* Top Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openModal('project', project)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors border border-gray-100"
                                        title="Settings"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-100"
                                        title="Dismiss"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {project.title}
                            </h2>

                            {project.description && (
                                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-4 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Calendar className="w-4 h-4 text-violet-500" />
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Date</div>
                                    <div className={`text-sm font-semibold ${dueDateStatus === 'overdue' ? 'text-red-500' :
                                        dueDateStatus === 'today' ? 'text-amber-500' : 'text-gray-700'
                                        }`}>
                                        {hasValidDueDate ? format(dueDate as Date, 'MMM d, yyyy') : 'Unscheduled'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[200px] flex items-center gap-4 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Execution</span>
                                        <span className="text-xs font-bold text-gray-700">{progress}%</span>
                                    </div>
                                    <div className="relative h-2 w-full bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Latest Progress</h3>
                                </div>
                                <button
                                    onClick={() => openModal('project-note', project)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Update Note
                                </button>
                            </div>

                            {/* Notes History List */}
                            <div className="space-y-4">
                                {projectNotes && projectNotes.length > 0 ? (
                                    projectNotes.map((note) => (
                                        <div key={note._id} className="relative group">
                                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-violet-100 rounded-full" />
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:border-violet-100 transition-colors relative">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                        <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 uppercase tracking-wider">
                                                            {format(new Date(note._creationTime), 'MMM d, h:mm a')}
                                                        </span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {editingNoteId !== note._id && (
                                                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditStart(note._id, note.summary)}
                                                                className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                                title="Edit Note"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(note._id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Note"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingNoteId === note._id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-gray-700 font-medium"
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => setEditingNoteId(null)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditSave(note._id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm shadow-violet-200"
                                                            >
                                                                <Save className="w-3.5 h-3.5" />
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 leading-relaxed font-medium italic whitespace-pre-wrap">
                                                        "{note.summary.replace(/<[^>]*>/g, '')}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                                            <Clock className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">No progress notes yet.</p>
                                        <button
                                            onClick={() => openModal('project-note', project)}
                                            className="text-xs text-violet-600 font-bold mt-2 hover:underline"
                                        >
                                            Add your first update
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Buttons moved to top */}
                <div className="mt-auto p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                        Updated {hasValidCreatedAt ? format(createdAt as Date, 'MMM d, yyyy') : 'Unknown'}
                    </p>
                </div>
            </div>
        </Modal>
    );
}

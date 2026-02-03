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

export function ProjectViewModal() {
    const { user } = useAuthStore();
    const { activeModal, modalData, closeModal, openModal, addToast } = useUIStore();

    const project = modalData as Project | null;

    const isOpen = activeModal === 'project-view';
    const projectId = project?.id;
    const userId = user?.id || '';

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

                            {project.notes ? (
                                <div className="relative group">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-violet-100 rounded-full" />
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:border-violet-100 transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 uppercase tracking-wider">
                                                {project.noteUpdatedAt ? format(new Date(project.noteUpdatedAt), 'MMM d, h:mm a') : 'Recently'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed font-medium italic whitespace-pre-wrap">
                                            "{project.notes.replace(/<[^>]*>/g, '')}"
                                        </p>
                                    </div>
                                </div>
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

                {/* Footer Actions */}
                <div className="mt-auto p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200">
                        <button
                            onClick={() => openModal('project', project)}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors border-r border-gray-200"
                        >
                            <Edit2 className="w-4 h-4" />
                            Settings
                        </button>
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-500 text-sm font-semibold transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                        Updated {hasValidCreatedAt ? format(createdAt as Date, 'MMM d, yyyy') : 'Unknown'}
                    </p>
                </div>
            </div>
        </Modal>
    );
}

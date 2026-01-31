import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import {
  Plus,
  Lightbulb,
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Flag,
  FileText
} from 'lucide-react';
import { useProjects, useUpdateProjectStatus } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';
import { Project, ProjectStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format, isPast, isToday } from 'date-fns';

const columns: { id: ProjectStatus; title: string; icon: React.ElementType; color: string }[] = [
  { id: 'ideation', title: 'Ideation', icon: Lightbulb, color: 'bg-amber-500' },
  { id: 'planning', title: 'Planning', icon: ClipboardList, color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, color: 'bg-violet-500' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'bg-green-500' },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export function KanbanBoard() {
  const { data: projects, isLoading } = useProjects();
  const updateStatus = useUpdateProjectStatus();
  const { openModal } = useUIStore();

  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      ideation: [],
      planning: [],
      in_progress: [],
      completed: [],
    };

    projects?.forEach((project) => {
      grouped[project.status].push(project);
    });

    return grouped;
  }, [projects]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ProjectStatus;

    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Tracker</h1>
          <p className="text-gray-500">Track your project ideas from concept to completion</p>
        </div>
        <Button onClick={() => openModal('project')} icon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnProjects = projectsByStatus[column.id];

            return (
              <div key={column.id} className="flex flex-col border-r border-gray-100 last:border-r-0 pr-4 last:pr-0">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-8 h-8 rounded-lg ${column.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="ml-auto text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[500px] p-2 rounded-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-violet-50/50' : 'bg-gray-50/50'
                        }`}
                    >
                      <div className="space-y-4">
                        {columnProjects.map((project, index) => (
                          <Draggable key={project.id} draggableId={project.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <ProjectCard
                                  project={project}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

function ProjectCard({
  project,
  isDragging,
}: {
  project: Project;
  isDragging: boolean;
}) {
  const { openModal } = useUIStore();

  const dueDateStatus = project.dueDate
    ? isPast(new Date(project.dueDate)) && !isToday(new Date(project.dueDate))
      ? 'overdue'
      : isToday(new Date(project.dueDate))
        ? 'today'
        : 'upcoming'
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        rotate: isDragging ? 1.5 : 0,
      }}
      whileHover={!isDragging ? { y: -2 } : undefined}
      onClick={() => openModal('project-view', project)}
      className={`bg-white rounded-xl p-4 cursor-pointer select-none transition-[shadow,border-color,background-color] ${isDragging ? 'shadow-2xl ring-1 ring-violet-200 z-50' : 'shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 line-clamp-2">{project.title}</h4>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      {/* Notes / Daily Progress */}
      {project.notes && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            openModal('project-note', project);
          }}
          className="mb-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 cursor-pointer transition-all group/note"
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-gray-400 group-hover/note:text-violet-400 uppercase tracking-wider transition-colors">
            <FileText className="w-3 h-3" />
            <span>Progress Note</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed italic">
            "{project.notes}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
        <Badge className={priorityColors[project.priority]} size="sm">
          <Flag className="w-3 h-3 mr-1" />
          {project.priority}
        </Badge>

        <div className="flex items-center gap-3">
          {!project.notes && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('project-note', project);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-violet-500 uppercase tracking-tight transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Note
            </button>
          )}

          {project.dueDate && (
            <span
              className={`text-xs font-medium flex items-center gap-1 ${dueDateStatus === 'overdue'
                ? 'text-red-500'
                : dueDateStatus === 'today'
                  ? 'text-amber-500'
                  : 'text-gray-400'
                }`}
            >
              <Calendar className="w-3 h-3" />
              {format(new Date(project.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

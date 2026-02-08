import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Lightbulb,
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Flag,
  FileText,
  Share2,
} from "lucide-react";
import { Project, ProjectStatus } from "@/types";
import { useUIStore } from "@/store/uiStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format, isPast, isToday, startOfDay } from "date-fns";

const columns: {
  id: ProjectStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "ideation", title: "Ideation", icon: Lightbulb, color: "bg-amber-500" },
  {
    id: "planning",
    title: "Planning",
    icon: ClipboardList,
    color: "bg-blue-500",
  },
  {
    id: "in_progress",
    title: "In Progress",
    icon: PlayCircle,
    color: "bg-violet-500",
  },
  {
    id: "completed",
    title: "Completed",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
];

const priorityColors = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface KanbanBoardUIProps {
  projects: Project[];
  onDragEnd?: (result: DropResult) => void;
  isReadOnly?: boolean;
  onAddProject?: () => void;
  onAddNote?: (project: Project) => void;
  onOpenProject?: (project: Project) => void;
  onOpenUpdates?: () => void;
  onShareBoard?: () => void;
}

export function KanbanBoardUI({
  projects,
  onDragEnd,
  isReadOnly = false,
  onAddProject,
  onAddNote,
  onOpenProject,
  onOpenUpdates,
  onShareBoard,
}: KanbanBoardUIProps) {
  const { initializedViews, markViewInitialized } = useUIStore();
  const hasInitialized = initializedViews.has("projects");

  React.useEffect(() => {
    if (!hasInitialized) {
      markViewInitialized("projects");
    }
  }, [hasInitialized, markViewInitialized]);

  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      ideation: [],
      planning: [],
      in_progress: [],
      completed: [],
    };

    projects?.forEach((project) => {
      if (grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });

    return grouped;
  }, [projects]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Project Tracker
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your project ideas from concept to completion
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isReadOnly && onShareBoard && (
            <Button
              variant="outline"
              onClick={onShareBoard}
              icon={<Share2 className="w-4 h-4" />}
              className="rounded-xl"
            >
              Share Board
            </Button>
          )}

          {onOpenUpdates && (
            <Button
              variant="outline"
              onClick={onOpenUpdates}
              icon={<FileText className="w-4 h-4" />}
              className="rounded-xl"
            >
              Project Updates
            </Button>
          )}

          {!isReadOnly && onAddProject && (
            <Button
              onClick={onAddProject}
              icon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd || (() => {})}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnProjects = projectsByStatus[column.id];

            return (
              <div key={column.id} className="flex flex-col h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl ${column.color} bg-opacity-10 flex items-center justify-center`}
                    >
                      <Icon
                        className={`w-5 h-5 ${column.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <h3 className="font-bold text-foreground text-lg">
                      {column.title}
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-card px-3 py-1 rounded-full shadow-sm border border-border">
                    {columnProjects.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id} isDropDisabled={isReadOnly}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[500px] p-3 rounded-[32px] transition-all duration-300 ${
                        snapshot.isDraggingOver
                          ? "bg-violet-50 dark:bg-violet-900/10 ring-2 ring-violet-200 dark:ring-violet-800 ring-inset"
                          : "bg-muted/50 border border-border/50"
                      }`}
                    >
                      <div className="space-y-3">
                        {columnProjects.map((project, index) => (
                          <Draggable
                            key={project.id}
                            draggableId={project.id}
                            index={index}
                            isDragDisabled={isReadOnly}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <ProjectCard
                                  project={project}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => onOpenProject?.(project)}
                                  onAddNote={() => onAddNote?.(project)}
                                  isReadOnly={isReadOnly}
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
  onClick,
  onAddNote,
  isReadOnly,
}: {
  project: Project;
  isDragging: boolean;
  onClick?: () => void;
  onAddNote?: () => void;
  isReadOnly?: boolean;
}) {
  const dueDateStatus = project.dueDate
    ? isPast(new Date(project.dueDate)) && !isToday(new Date(project.dueDate))
      ? "overdue"
      : isToday(new Date(project.dueDate))
        ? "today"
        : "upcoming"
    : null;

  return (
    <motion.div
      animate={{
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0,
        zIndex: isDragging ? 50 : 0,
      }}
      whileHover={
        !isDragging && !isReadOnly ? { y: -4, scale: 1.01 } : undefined
      }
      onClick={!isReadOnly ? onClick : undefined}
      className={`bg-card rounded-[24px] p-5 ${!isReadOnly ? "cursor-pointer" : ""} select-none transition-shadow duration-300 ${
        isDragging
          ? "shadow-2xl ring-2 ring-violet-500 shadow-violet-500/20"
          : "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] border border-border/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-bold text-card-foreground leading-snug line-clamp-2 pr-2">
          {project.title}
        </h4>
        <Badge
          className={`${priorityColors[project.priority]} border-0 font-semibold px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider shrink-0`}
        >
          {project.priority}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Notes / Daily Progress - Only show if updated today */}
      {(() => {
        const noteUpdatedAt = project.noteUpdatedAt;
        const isNoteFromToday =
          noteUpdatedAt &&
          startOfDay(new Date(noteUpdatedAt)).getTime() ===
            startOfDay(new Date()).getTime();
        return project.notes && isNoteFromToday ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isReadOnly && onAddNote) onAddNote();
            }}
            className={`mb-4 p-3 bg-muted/50 rounded-2xl border border-border ${!isReadOnly ? "hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 cursor-pointer" : ""} transition-all group/note`}
          >
            <div
              className={`flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-muted-foreground ${!isReadOnly ? "group-hover/note:text-violet-500 dark:group-hover/note:text-violet-400" : ""} uppercase tracking-wider transition-colors`}
            >
              <FileText className="w-3 h-3" />
              <span>Progress Note</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed italic">
              "{project.notes.replace(/<[^>]*>/g, "")}"
            </p>
          </div>
        ) : null;
      })()}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {project.dueDate && (
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                dueDateStatus === "overdue"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : dueDateStatus === "today"
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(project.dueDate), "MMM d")}
            </span>
          )}
          {(() => {
            const noteUpdatedAt = project.noteUpdatedAt;
            const isNoteFromToday =
              noteUpdatedAt &&
              startOfDay(new Date(noteUpdatedAt)).getTime() ===
                startOfDay(new Date()).getTime();
            return isNoteFromToday ? (
              <span className="text-[10px] font-bold flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg uppercase tracking-tight">
                <CheckCircle2 className="w-3 h-3" />
                Tracked Today
              </span>
            ) : null;
          })()}
        </div>

        {(() => {
          const noteUpdatedAt = project.noteUpdatedAt;
          const isNoteFromToday =
            noteUpdatedAt &&
            startOfDay(new Date(noteUpdatedAt)).getTime() ===
              startOfDay(new Date()).getTime();
          const showAddButton =
            !isReadOnly && (!project.notes || !isNoteFromToday);
          return showAddButton ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAddNote) onAddNote();
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-2 py-1 rounded-lg uppercase tracking-tight transition-all"
            >
              <Plus className="w-3 h-3" />
              Add Note
            </button>
          ) : null;
        })()}
      </div>
    </motion.div>
  );
}

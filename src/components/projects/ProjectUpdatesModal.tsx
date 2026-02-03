import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useProjects } from '@/hooks/useProjects';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  getHours,
  getMinutes,
  isToday,
  startOfDay
} from 'date-fns';

const typeLabels = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  note: 'Note',
};

const typeStyles = {
  created: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  updated: 'bg-blue-50 text-blue-700 border-blue-100',
  deleted: 'bg-red-50 text-red-700 border-red-100',
  note: 'bg-violet-50 text-violet-700 border-violet-100',
};

const cardStyles = {
  created: 'bg-white border-l-4 border-l-emerald-500 shadow-sm border-y border-r border-gray-100',
  updated: 'bg-white border-l-4 border-l-blue-500 shadow-sm border-y border-r border-gray-100',
  deleted: 'bg-white border-l-4 border-l-red-500 shadow-sm border-y border-r border-gray-100',
  note: 'bg-white border-l-4 border-l-violet-500 shadow-sm border-y border-r border-gray-100',
};

export function ProjectUpdatesModal() {
  const { user } = useAuthStore();
  const { activeModal, closeModal, activeTeamId } = useUIStore();
  const { data: projects } = useProjects();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const userId = user?.id || '';
  const isOpen = activeModal === 'project-updates';

  // Fetch all updates (we'll filter client-side for the calendar view)
  const updates = useQuery(api.projects.getProjectUpdates, {
    userId,
    teamId: (activeTeamId as Id<"teams">) || undefined
  });

  const authorIds = useMemo(() => {
    const ids = new Set<string>();
    (updates || []).forEach((update: any) => ids.add(update.authorId));
    return Array.from(ids);
  }, [updates]);

  const profiles = useQuery(
    api.profiles.getProfilesByUserIds,
    authorIds.length ? { userIds: authorIds } : 'skip'
  );

  const profileMap = useMemo(() => {
    const map = new Map<string, any>();
    (profiles || []).forEach((profile: any) => {
      map.set(profile.userId, profile);
    });
    return map;
  }, [profiles]);

  const projectMap = useMemo(() => {
    const map = new Map<string, any>();
    (projects || []).forEach((project) => map.set(project.id, project));
    return map;
  }, [projects]);

  const [filters, setFilters] = useState({
    projectId: 'all',
    authorId: 'all',
    type: 'all',
    query: '',
  });

  // Week generation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Filter updates
  const filteredUpdates = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return (updates || []).filter((update: any) => {
      // Basic Filters
      if (filters.projectId !== 'all' && update.projectId !== filters.projectId) return false;
      if (filters.authorId !== 'all' && update.authorId !== filters.authorId) return false;
      if (filters.type !== 'all' && update.type !== filters.type) return false;

      // Search Query
      if (query) {
        const profile = profileMap.get(update.authorId);
        const authorName = profile?.fullName || profile?.username || '';
        const summary = update.summary?.toLowerCase() || '';
        const project = projectMap.get(update.projectId);
        const projectTitle = project?.title?.toLowerCase() || '';

        return [authorName.toLowerCase(), summary, projectTitle].some(v => v.includes(query));
      }

      return true;
    });
  }, [updates, filters, profileMap, projectMap]);

  // Group updates by day for the current week
  const updatesByDay = useMemo(() => {
    const map = new Map<string, any[]>();

    // Initialize map for all days in view
    weekDays.forEach(day => {
      map.set(format(day, 'yyyy-MM-dd'), []);
    });

    filteredUpdates.forEach((update: any) => {
      const date = new Date(update._creationTime);
      const key = format(date, 'yyyy-MM-dd');

      // Only include if it's in the current view week
      if (map.has(key)) {
        map.get(key)?.push(update);
      }
    });

    return map;
  }, [filteredUpdates, weekDays]);

  // Navigation handlers
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  if (!isOpen) return null;

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...(projects || []).map(p => ({ value: p.id, label: p.title }))
  ];

  const authorOptions = [
    { value: 'all', label: 'All Authors' },
    ...Array.from(profileMap.values()).map((p: any) => ({
      value: p.userId,
      label: p.fullName || p.username || 'Unknown'
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(typeLabels).map(([value, label]) => ({ value, label }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="full"
      className="max-w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-2xl"
    >
      {/* Top Header */}
      <div className="flex flex-col border-b border-gray-100 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>

            <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
              <button
                onClick={prevWeek}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                Today
              </button>
              <button
                onClick={nextWeek}
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500 hover:text-gray-900"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                placeholder="Search updates..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white border hover:border-gray-200 focus:border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 w-64 transition-all"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters
                ? 'bg-violet-50 border-violet-200 text-violet-600 shadow-inner'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={closeModal}
              className="p-2.5 rounded-xl border border-transparent hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 pb-6 pt-0 grid grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
            <Select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              options={projectOptions}
              className="w-full"
            />

            <Select
              value={filters.authorId}
              onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}
              options={authorOptions}
              className="w-full"
            />

            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              options={typeOptions}
              className="w-full"
            />

            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                onClick={() => setFilters({ projectId: 'all', authorId: 'all', type: 'all', query: '' })}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden relative bg-gray-50/30">
        {/* Scrollable Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
        >
          <div className="flex min-w-full relative min-h-full">

            {/* Days Columns */}
            <div className="flex-1 flex min-w-0">
              {weekDays.map((day, dayIndex) => {
                const isTodayDate = isToday(day);
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayUpdates = updatesByDay.get(dayKey) || [];

                return (
                  <div
                    key={dayKey}
                    className={`flex-1 min-w-0 border-r border-gray-100/50 relative group ${dayIndex === 6 ? 'border-r-0' : ''} ${isTodayDate ? 'bg-violet-50/5' : ''}`}
                  >

                    {/* Sticky Day Header */}
                    <div className={`sticky top-0 z-20 h-16 border-b border-gray-100 flex flex-col items-center justify-center gap-1 shadow-sm transition-colors ${isTodayDate ? 'bg-violet-50/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'}`}>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isTodayDate ? 'text-violet-600' : 'text-gray-400'}`}>
                        {format(day, 'EEEE')}
                      </span>
                      <div className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all ${isTodayDate ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-110' : 'text-gray-900 group-hover:bg-gray-100 group-hover:scale-105'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>

                    {/* Events Stack */}
                    <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-200px)]">
                      {dayUpdates.map((update) => {
                        const date = new Date(update._creationTime);

                        const profile = profileMap.get(update.authorId);
                        const project = projectMap.get(update.projectId);

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={update._id}
                            onClick={() => setSelectedUpdate({ ...update, profile, project })}
                            className={`w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 cursor-pointer group/card overflow-hidden relative`}
                          >
                            <div className={`absolute top-0 left-0 w-1 h-full ${update.type === 'created' ? 'bg-emerald-500' :
                              update.type === 'updated' ? 'bg-blue-500' :
                                update.type === 'deleted' ? 'bg-red-500' :
                                  'bg-violet-500'
                              }`} />

                            <div className="flex gap-3 pl-2">
                              <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-gray-50 transition-transform group-hover/card:scale-105">
                                <AvatarImage src={profile?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${update.authorId}`} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-bold">
                                  {profile?.fullName?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex flex-col min-w-0 flex-1 gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-900 truncate">
                                    {profile?.fullName || 'Unknown'}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                    {format(date, 'h:mm a')}
                                  </span>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 group-hover/card:text-gray-900 transition-colors">
                                  {update.summary}
                                </p>

                                {project && (
                                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    <p className="text-xs font-medium text-gray-500 truncate group-hover/card:text-violet-600 transition-colors">
                                      {project.title}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Update Detail Modal */}
      {selectedUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedUpdate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          >
            {/* Header with colored top bar */}
            <div className={`h-2 ${selectedUpdate.type === 'created' ? 'bg-emerald-500' :
              selectedUpdate.type === 'updated' ? 'bg-blue-500' :
                selectedUpdate.type === 'deleted' ? 'bg-red-500' :
                  'bg-violet-500'
              }`} />

            <div className="p-6">
              {/* Author & Time */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-12 h-12 ring-4 ring-gray-50">
                  <AvatarImage src={selectedUpdate.profile?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${selectedUpdate.authorId}`} />
                  <AvatarFallback className="text-sm bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-bold">
                    {selectedUpdate.profile?.fullName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {selectedUpdate.profile?.fullName || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(selectedUpdate._creationTime), 'MMMM d, yyyy · h:mm a')}
                  </div>
                </div>
                <Badge className={typeStyles[selectedUpdate.type as keyof typeof typeStyles]}>
                  {typeLabels[selectedUpdate.type as keyof typeof typeLabels]}
                </Badge>
              </div>

              {/* Project Tag */}
              {selectedUpdate.project && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{selectedUpdate.project.title}</span>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Update Description</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedUpdate.summary || 'No description provided.'}
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setSelectedUpdate(null)}
                  variant="secondary"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Modal>
  );
}

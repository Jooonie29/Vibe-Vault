import { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X
} from 'lucide-react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  getHours,
  getMinutes,
  isToday
} from 'date-fns';
import { Project } from '@/types';

const typeLabels = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  note: 'Note',
};

const cardStyles = {
  created: 'bg-emerald-50/90 hover:bg-emerald-100 border-l-4 border-l-emerald-500 border-y border-r border-emerald-200/50 shadow-sm',
  updated: 'bg-blue-50/90 hover:bg-blue-100 border-l-4 border-l-blue-500 border-y border-r border-blue-200/50 shadow-sm',
  deleted: 'bg-red-50/90 hover:bg-red-100 border-l-4 border-l-red-500 border-y border-r border-red-200/50 shadow-sm',
  note: 'bg-violet-50/90 hover:bg-violet-100 border-l-4 border-l-violet-500 border-y border-r border-violet-200/50 shadow-sm',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 100;

interface PublicProjectUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  projects: Project[];
}

export function PublicProjectUpdatesModal({ isOpen, onClose, token, projects }: PublicProjectUpdatesModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all updates
  const updates = useQuery(api.boardShares.getPublicBoardUpdates, { token });

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
      map.set(day.toISOString().split('T')[0], []);
    });

    filteredUpdates.forEach((update: any) => {
      const date = new Date(update._creationTime);
      const key = date.toISOString().split('T')[0];

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

  // Scroll to 8 AM on open
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // 8 AM * HOUR_HEIGHT
      scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, [isOpen]);

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
      onClose={onClose}
      size="full"
      className="max-w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden bg-white rounded-3xl"
    >
      {/* Top Header */}
      <div className="flex flex-col border-b border-gray-100 bg-gray-50/50 z-20">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={prevWeek}
                className="p-2 hover:bg-gray-50 hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-sm rounded-lg transition-all"
              >
                Today
              </button>
              <button
                onClick={nextWeek}
                className="p-2 hover:bg-gray-50 hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900"
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
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-64 transition-all shadow-sm"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all shadow-sm ${showFilters
                ? 'bg-violet-50 border-violet-200 text-violet-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all ml-2 bg-white shadow-sm"
            >
              <X className="w-5 h-5" />
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
              className="w-full bg-white shadow-sm"
            />

            <Select
              value={filters.authorId}
              onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}
              options={authorOptions}
              className="w-full bg-white shadow-sm"
            />

            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              options={typeOptions}
              className="w-full bg-white shadow-sm"
            />

            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                onClick={() => setFilters({ projectId: 'all', authorId: 'all', type: 'all', query: '' })}
                className="text-gray-500 hover:text-gray-900"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Scrollable Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
        >
          <div className="flex min-w-full relative">

            {/* Days Columns */}
            <div className="flex-1 flex min-w-0">
              {weekDays.map((day, dayIndex) => {
                const isTodayDate = isToday(day);
                const dayKey = day.toISOString().split('T')[0];
                const dayUpdates = updatesByDay.get(dayKey) || [];

                return (
                  <div
                    key={dayKey}
                    className={`flex-1 min-w-0 border-r border-gray-100 relative group ${dayIndex === 6 ? 'border-r-0' : ''} ${isTodayDate ? 'bg-violet-50/10' : ''}`}
                  >

                    {/* Sticky Day Header */}
                    <div className={`sticky top-0 z-20 h-14 border-b border-gray-100 flex items-center justify-center gap-2 shadow-sm ${isTodayDate ? 'bg-violet-50/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'}`}>
                      <span className={`text-sm font-medium uppercase ${isTodayDate ? 'text-violet-600' : 'text-gray-500'}`}>
                        {format(day, 'EEE')}
                      </span>
                      <span className={`text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'text-gray-900'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Grid Lines */}
                    <div className="relative">
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          className="border-b border-gray-50 w-full"
                          style={{ height: HOUR_HEIGHT }}
                        />
                      ))}

                      {/* Current Time Indicator (if today) */}
                      {isTodayDate && (
                        <div
                          className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none"
                          style={{
                            top: (getHours(new Date()) * HOUR_HEIGHT) + (getMinutes(new Date()) / 60 * HOUR_HEIGHT)
                          }}
                        >
                          <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                        </div>
                      )}

                      {/* Events */}
                      {dayUpdates.map((update) => {
                        const date = new Date(update._creationTime);
                        const hour = getHours(date);
                        const minute = getMinutes(date);
                        const top = (hour * HOUR_HEIGHT) + (minute / 60 * HOUR_HEIGHT);

                        const profile = profileMap.get(update.authorId);
                        const project = projectMap.get(update.projectId);
                        const typeStyle = cardStyles[update.type as keyof typeof cardStyles] || cardStyles.note;

                        return (
                          <div
                            key={update._id}
                            className={`absolute left-1 right-1 p-3 rounded-2xl border transition-all hover:z-50 hover:shadow-lg cursor-pointer group/card overflow-hidden ${typeStyle}`}
                            style={{
                              top: `${top}px`,
                              height: `${HOUR_HEIGHT}px`, // Fixed height for visual consistency
                            }}
                          >
                            <div className="flex gap-3 h-full">
                              <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white">
                                <AvatarImage src={profile?.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${update.authorId}`} />
                                <AvatarFallback className="text-xs bg-white text-gray-600 font-bold">
                                  {profile?.fullName?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex flex-col min-w-0 flex-1 justify-center">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-gray-700 truncate">
                                    {profile?.fullName || 'Unknown'}
                                  </span>
                                  <span className="text-[10px] text-gray-500 bg-white/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                    {format(date, 'h:mm a')}
                                  </span>
                                </div>

                                <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 group-hover/card:line-clamp-none transition-all">
                                  {update.summary}
                                </p>

                                {project && (
                                  <p className="text-[10px] text-gray-500 mt-1 truncate">
                                    {project.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
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
    </Modal>
  );
}

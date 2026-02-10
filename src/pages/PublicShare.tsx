import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Calendar, CheckCircle2, Clock, FileText, Flag, Share2 } from 'lucide-react';
import { format, formatDistanceToNow, isPast, isToday, isValid } from 'date-fns';

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

const typeLabels = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  note: 'Note',
};

const typeStyles = {
  created: 'bg-emerald-50 text-emerald-700',
  updated: 'bg-blue-50 text-blue-700',
  deleted: 'bg-red-50 text-red-700',
  note: 'bg-violet-50 text-violet-700',
};

const dateOptions = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const PublicSharePage = () => {
  const { token } = useParams();
  const shareData = useQuery(api.publicShares.getPublicShareByToken, token ? { token } : 'skip');
  const logAccess = useMutation(api.publicShares.logPublicShareAccess);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [filters, setFilters] = useState({
    authorId: 'all',
    type: 'all',
    dateRange: 'all',
    sort: 'newest',
    query: '',
  });

  useEffect(() => {
    if (!token) return;
    void logAccess({ token, referrer: document.referrer || undefined });
  }, [token, logAccess]);

  const sharePayload = shareData as any;
  const project = sharePayload?.project;
  const updates = useMemo(() => sharePayload?.updates ?? [], [sharePayload?.updates]);
  const authors = useMemo(() => sharePayload?.authors ?? [], [sharePayload?.authors]);

  const authorMap = useMemo(() => {
    const map = new Map<string, any>();
    (authors || []).forEach((entry: any) => map.set(entry.userId, entry.profile));
    return map;
  }, [authors]);

  const getAuthorLabel = useCallback(
    (authorId: string) => {
      const profile = authorMap.get(authorId);
      return profile?.fullName || profile?.username || authorId;
    },
    [authorMap]
  );

  const authorOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All authors' }];
    (authors || []).forEach((entry: any) => {
      const profile = entry.profile;
      options.push({
        value: entry.userId,
        label: profile?.fullName || profile?.username || entry.userId,
      });
    });
    return options;
  }, [authors]);

  const sortedUpdates = useMemo(() => {
    return [...(updates || [])].sort((a: any, b: any) => b._creationTime - a._creationTime);
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    const now = Date.now();
    const cutoff =
      filters.dateRange === '7d'
        ? now - 7 * 24 * 60 * 60 * 1000
        : filters.dateRange === '30d'
          ? now - 30 * 24 * 60 * 60 * 1000
          : filters.dateRange === '90d'
            ? now - 90 * 24 * 60 * 60 * 1000
            : 0;

    const query = filters.query.trim().toLowerCase();

    const filtered = (updates || []).filter((update: any) => {
      if (filters.type !== 'all' && update.type !== filters.type) return false;
      if (filters.authorId !== 'all' && update.authorId !== filters.authorId) return false;
      if (filters.dateRange !== 'all' && update._creationTime < cutoff) return false;
      if (query) {
        const authorLabel = getAuthorLabel(update.authorId).toLowerCase();
        const summary = update.summary?.toLowerCase() || '';
        const title = project?.title?.toLowerCase() || '';
        if (![authorLabel, summary, title].some((value) => value.includes(query))) return false;
      }
      return true;
    });

    return filtered.sort((a: any, b: any) =>
      filters.sort === 'newest' ? b._creationTime - a._creationTime : a._creationTime - b._creationTime
    );
  }, [filters, updates, project?.title, getAuthorLabel]);

  if (shareData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Loading public view...</div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share not available</h1>
          <p className="text-gray-500 mb-6">This public link is disabled or has expired.</p>
          <Link className="text-violet-600 font-semibold hover:underline" to="/">Return to Vault Vibe</Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig = project?.status ? statusConfig[project.status] : statusConfig.ideation;
  const StatusIcon = currentStatusConfig.icon;
  const priorityColor = project?.priority ? priorityColors[project.priority] : priorityColors.medium;
  const progress = typeof project?.progress === 'number' ? project.progress : 0;
  const dueDate = project?.dueDate ? new Date(project.dueDate) : null;
  const hasValidDueDate = dueDate ? isValid(dueDate) : false;
  const dueDateStatus = hasValidDueDate
    ? isPast(dueDate as Date) && !isToday(dueDate as Date)
      ? 'overdue'
      : isToday(dueDate as Date)
        ? 'today'
        : 'upcoming'
    : null;
  const createdAt = project?._creationTime ? new Date(project._creationTime) : null;
  const hasValidCreatedAt = createdAt ? isValid(createdAt) : false;

  const previewUpdates = sortedUpdates.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Vault Vibe_black.png" alt="Vault Vibe" className="w-5 h-5" />
            <span className="font-bold text-gray-900">Vault Vibe</span>
          </div>
          <Link className="text-sm font-semibold text-violet-600 hover:underline" to="/">Open Vault Vibe</Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
            {project.description && (
              <p className="text-gray-500 text-lg leading-relaxed max-w-3xl">{project.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-100">
              <Calendar className="w-4 h-4 text-violet-500" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Date</div>
                <div className={`text-sm font-semibold ${dueDateStatus === 'overdue' ? 'text-red-500' : dueDateStatus === 'today' ? 'text-amber-500' : 'text-gray-700'}`}>
                  {hasValidDueDate ? format(dueDate as Date, 'MMM d, yyyy') : 'Unscheduled'}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[220px] flex items-center gap-4 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Execution</span>
                  <span className="text-xs font-bold text-gray-700">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900">Latest updates</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setUpdatesOpen(true)} icon={<Share2 className="w-4 h-4" />}>
                View timeline
              </Button>
            </div>

            {previewUpdates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-sm text-gray-500 font-medium">No updates yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {previewUpdates.map((update: any) => (
                  <div key={update._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Badge className={typeStyles[update.type as keyof typeof typeStyles]} size="sm">
                      {typeLabels[update.type as keyof typeof typeLabels]}
                    </Badge>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{update.summary}</p>
                      <p className="text-xs text-gray-500">
                        {getAuthorLabel(update.authorId)} · {formatDistanceToNow(new Date(update._creationTime), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Updated {hasValidCreatedAt ? format(createdAt as Date, 'MMM d, yyyy') : 'Unknown'}
          </div>
        </div>
      </div>

      <Modal isOpen={updatesOpen} onClose={() => setUpdatesOpen(false)} title="Project Updates" size="lg">
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Search"
              placeholder="Search updates"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
            <Select
              label="Author"
              options={authorOptions}
              value={filters.authorId}
              onChange={(event) => setFilters({ ...filters, authorId: event.target.value })}
            />
            <Select
              label="Type"
              options={[
                { value: 'all', label: 'All updates' },
                { value: 'created', label: 'Created' },
                { value: 'updated', label: 'Updated' },
                { value: 'deleted', label: 'Deleted' },
                { value: 'note', label: 'Notes' },
              ]}
              value={filters.type}
              onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            />
            <Select
              label="Date range"
              options={dateOptions}
              value={filters.dateRange}
              onChange={(event) => setFilters({ ...filters, dateRange: event.target.value })}
            />
            <Select
              label="Sort"
              options={sortOptions}
              value={filters.sort}
              onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
            />
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-sm text-gray-500 font-medium">No updates match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map((update: any) => (
                <div key={update._id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                  <Badge className={typeStyles[update.type as keyof typeof typeStyles]} size="sm">
                    {typeLabels[update.type as keyof typeof typeLabels]}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{update.summary}</p>
                    <p className="text-xs text-gray-500">
                      {getAuthorLabel(update.authorId)} · {formatDistanceToNow(new Date(update._creationTime), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PublicSharePage;

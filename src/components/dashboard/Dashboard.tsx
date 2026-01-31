import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  Plus,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react';
import { useStats, useItems } from '@/hooks/useItems';
import { useProjects } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

const statCards = [
  { key: 'snippets', label: 'Code Snippets', icon: Code2, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
  { key: 'prompts', label: 'AI Prompts', icon: MessageSquare, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
  { key: 'files', label: 'File Assets', icon: FolderOpen, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50' },
  { key: 'projects', label: 'Projects', icon: Kanban, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  const { data: projects } = useProjects();
  const { openModal, setCurrentView } = useUIStore();

  const inProgressProjects = projects?.filter(p => p.status === 'in_progress') || [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Hero Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 text-white"
      >
        <div className="relative z-10 flex items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
              <span className="text-sm font-medium text-white/80">Welcome to your vault</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Developer Hub</h1>
            <p className="text-white/80 max-w-md">
              Store, organize, and access your code snippets, AI prompts, and project ideas all in one place.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            const value = stats?.[stat.key as keyof typeof stats] || 0;

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 + index * 0.1 }}
                        className="text-3xl font-bold text-gray-900"
                      >
                        {value}
                      </motion.p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('blue') ? '#3B82F6' : stat.color.includes('purple') ? '#8B5CF6' : stat.color.includes('amber') ? '#F59E0B' : '#10B981' }} />
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Snippet', icon: Code2, type: 'code', color: 'bg-blue-500' },
            { label: 'New Prompt', icon: MessageSquare, type: 'prompt', color: 'bg-purple-500' },
            { label: 'Upload File', icon: FolderOpen, type: 'file', color: 'bg-amber-500' },
            { label: 'New Project', icon: Kanban, type: 'project', color: 'bg-green-500' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.type}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => action.type === 'project' ? openModal('project') : openModal('item', { type: action.type })}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Items & In Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <motion.div variants={item}>
          <Card padding="none">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Recent Items
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {itemsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : recentItems?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No items yet. Start building your vault!</p>
                  <Button size="sm" onClick={() => openModal('item', { type: 'code' })}>
                    Create First Item
                  </Button>
                </div>
              ) : (
                recentItems?.slice(0, 5).map((item) => {
                  const Icon = item.type === 'code' ? Code2 : item.type === 'prompt' ? MessageSquare : FolderOpen;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      onClick={() => openModal('item', item)}
                      className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'code' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'prompt' ? 'bg-purple-100 text-purple-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date((item as any)._creationTime), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* In Progress Projects */}
        <motion.div variants={item}>
          <Card padding="none">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Kanban className="w-5 h-5 text-green-600" />
                In Progress
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setCurrentView('projects')}>
                View All
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {inProgressProjects.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No projects in progress.</p>
                  <Button size="sm" onClick={() => openModal('project')}>
                    Start a Project
                  </Button>
                </div>
              ) : (
                inProgressProjects.slice(0, 4).map((project) => (
                  <div key={project.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{project.title}</p>
                      <span className="text-sm text-gray-500">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

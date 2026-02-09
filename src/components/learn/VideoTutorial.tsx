import React from 'react';
import { Play, Clock, BookOpen, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const VideoTutorial = () => {
  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with Vault Vibe',
      duration: '5:20',
      category: 'Basics',
      thumbnail: 'bg-gradient-to-br from-violet-500 to-purple-600',
      description: 'Learn the fundamentals of organizing your workspace and navigating the interface.'
    },
    {
      id: 2,
      title: 'Managing Code Snippets',
      duration: '8:45',
      category: 'Code Library',
      thumbnail: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      description: 'Master the Code Library: creating, tagging, and searching your code snippets efficiently.'
    },
    {
      id: 3,
      title: 'Prompt Engineering 101',
      duration: '12:10',
      category: 'AI Prompts',
      thumbnail: 'bg-gradient-to-br from-pink-500 to-rose-600',
      description: 'How to structure, save, and refine your AI prompts for better results.'
    },
    {
      id: 4,
      title: 'Project Management Workflow',
      duration: '15:30',
      category: 'Projects',
      thumbnail: 'bg-gradient-to-br from-amber-500 to-orange-600',
      description: 'Deep dive into Kanban boards, task management, and team collaboration features.'
    },
    {
      id: 5,
      title: 'Advanced File Organization',
      duration: '6:15',
      category: 'Files',
      thumbnail: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      description: 'Tips and tricks for keeping your digital assets organized and easily accessible.'
    },
    {
      id: 6,
      title: 'Team Collaboration Features',
      duration: '10:00',
      category: 'Teams',
      thumbnail: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      description: 'Learn how to invite members, manage permissions, and work together effectively.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Tutorials</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-3xl">
          Watch our step-by-step guides to master Vault Vibe and boost your productivity.
          From basic setup to advanced workflows, we've got you covered.
        </p>
      </div>

      {/* Featured Video */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video md:aspect-[21/9] group cursor-pointer shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
        
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-violet-600 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
          <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-none mb-4">
            New Arrival
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-2">Vault Vibe 1.0 Walkthrough</h2>
          <p className="text-gray-200 max-w-2xl mb-4 line-clamp-2">
            Explore the latest features including the new AI assistant, enhanced project management tools, and improved team collaboration workflows.
          </p>
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 18:45</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" /> 4.9/5</span>
            <span>Updated 2 days ago</span>
          </div>
        </div>
      </div>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="group cursor-pointer hover:shadow-lg transition-all border-gray-200 dark:border-white/10 overflow-hidden">
            <div className={`h-48 ${tutorial.thumbnail} relative`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">
                {tutorial.duration}
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  {tutorial.category}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                {tutorial.title}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4 line-clamp-2">
                {tutorial.description}
              </p>
              
              <div className="flex items-center text-sm font-medium text-violet-600 dark:text-violet-400 group/link">
                Watch now
                <ChevronRight className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Help Banner */}
      <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-2xl font-bold text-white">Need more help?</h2>
          <p className="text-gray-400">
            Can't find what you're looking for in the tutorials? Check out our documentation or chat with our support team.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="bg-transparent text-white border-gray-700 hover:bg-gray-800">
            Read Documentation
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

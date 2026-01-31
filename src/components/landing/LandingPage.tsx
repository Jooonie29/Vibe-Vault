import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Cloud,
  Github,
  Twitter
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Code2,
    title: 'Code Snippets',
    description: 'Store and organize reusable code blocks with syntax highlighting for 20+ languages.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: MessageSquare,
    title: 'AI Prompts',
    description: 'Build your library of engineered prompts for ChatGPT, Claude, and other LLMs.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: FolderOpen,
    title: 'File Assets',
    description: 'Upload and manage design files, icons, documentation, and more.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Kanban,
    title: 'Project Tracker',
    description: 'Track your app ideas from concept to completion with a Kanban board.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
];

const benefits = [
  'Unlimited code snippets and prompts',
  'Drag-and-drop file uploads',
  'Full-text search across all items',
  'Custom tags and categories',
  'Kanban project management',
  'Secure cloud storage',
];

export function LandingPage() {
  const { openModal } = useUIStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="Vibe Vault Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-gray-900">Vibe Vault</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => openModal('auth')}>
                Sign In
              </Button>
              <Button onClick={() => openModal('auth', { view: 'register' })}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Your Personal Developer Knowledge Hub
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Store, Organize &{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Access
              </span>{' '}
              Your Dev Assets
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Vibe Vault is your centralized repository for code snippets, AI prompts,
              file assets, and project ideas. Everything you need, in one beautiful place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => openModal('auth')}
                icon={<ArrowRight className="w-5 h-5" />}
                className="text-lg px-8"
              >
                Start Building Your Vault
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-1">
              <div className="bg-gray-900 rounded-[22px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-4 text-white mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
                    <div className="w-4 h-4 rounded bg-white/20" />
                    <span>Welcome to your vault</span>
                  </div>
                  <div className="text-base font-semibold mb-1">Your Developer Hub</div>
                  <p className="text-xs text-white/80 max-w-[260px]">
                    Store, organize, and access your code snippets, AI prompts, and project ideas all in one place.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Snippets', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Prompts', color: 'from-purple-500 to-pink-500' },
                    { label: 'Files', color: 'from-amber-500 to-orange-500' },
                    { label: 'Projects', color: 'from-green-500 to-emerald-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-800 rounded-xl p-3">
                      <div className="text-[10px] text-gray-400 mb-2">{stat.label}</div>
                      <div className="text-lg font-semibold text-white">24</div>
                      <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${stat.color}`} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-300 mb-3">Recent Items</div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-700/70" />
                          <div className="flex-1">
                            <div className="h-3 w-28 bg-gray-700/60 rounded" />
                            <div className="h-2 w-16 bg-gray-700/40 rounded mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-300 mb-3">In Progress</div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i}>
                          <div className="h-2 w-16 bg-gray-700/60 rounded mb-2" />
                          <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need, Organized
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four powerful modules to keep your developer life organized and productive.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: feature.color.includes('blue') ? '#3B82F6' : feature.color.includes('purple') ? '#8B5CF6' : feature.color.includes('amber') ? '#F59E0B' : '#10B981' }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Developers,{' '}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  By Developers
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We understand the chaos of managing code snippets, prompts, and project ideas
                across multiple tools. Vibe Vault brings it all together.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl opacity-20 blur-2xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure by Default</h4>
                    <p className="text-sm text-gray-500">Your data is encrypted and private</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cloud Synced</h4>
                    <p className="text-sm text-gray-500">Access from anywhere, anytime</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lightning Fast</h4>
                    <p className="text-sm text-gray-500">Built with modern tech stack</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwLTItMi0yLTRzMi00IDItNGMtMiAwLTQtMi00LTJzLTIgMi00IDJjMCAyIDIgNCAyIDRzLTIgMi0yIDRjMCAyIDIgNCAyIDRzMiAyIDQgMmMwIDAgMiAyIDIgNHMtMiA0LTIgNGMyIDAgNC0yIDQtMnMyLTIgNC0yYzAtMi0yLTQtMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Build Your Vault?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join developers who are already organizing their knowledge and boosting productivity.
              </p>
              <Button
                size="lg"
                onClick={() => openModal('auth')}
                className="bg-white text-violet-600 hover:bg-white/90 text-lg px-8"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="Vibe Vault Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-gray-900">Vibe Vault</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 Vibe Vault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
  Twitter,
  Star,
  Users,
  Clock,
  Lock,
  Globe,
  Play,
  ChevronRight,
  Quote
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const features = [
  {
    icon: Code2,
    title: 'Code Snippets',
    description: 'Store and organize reusable code blocks with syntax highlighting for 20+ languages.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50/80',
  },
  {
    icon: MessageSquare,
    title: 'AI Prompts',
    description: 'Build your library of engineered prompts for ChatGPT, Claude, and other LLMs.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50/80',
  },
  {
    icon: FolderOpen,
    title: 'File Assets',
    description: 'Upload and manage design files, icons, documentation, and more.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50/80',
  },
  {
    icon: Kanban,
    title: 'Project Tracker',
    description: 'Track your app ideas from concept to completion with a Kanban board.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50/80',
  },
];

const stats = [
  { value: '10K+', label: 'Active Users', icon: Users },
  { value: '50K+', label: 'Snippets Saved', icon: Code2 },
  { value: '99.9%', label: 'Uptime', icon: Cloud },
  { value: '4.9/5', label: 'User Rating', icon: Star },
];

const testimonials = [
  {
    quote: "Vibe Vault has completely transformed how I organize my development workflow. It's like having a second brain for all my code and prompts.",
    author: "Sarah Chen",
    role: "Senior Frontend Developer",
    company: "TechCorp",
    avatar: "SC"
  },
  {
    quote: "The AI prompt management feature alone is worth it. I've saved hundreds of hours by having my best prompts organized and ready to use.",
    author: "Marcus Johnson",
    role: "Full Stack Developer",
    company: "StartupXYZ",
    avatar: "MJ"
  },
  {
    quote: "Finally, a tool that understands what developers actually need. Clean, fast, and incredibly useful.",
    author: "Emily Rodriguez",
    role: "Software Engineer",
    company: "Google",
    avatar: "ER"
  }
];

const trustLogos = [
  { name: 'Vercel', icon: '▲' },
  { name: 'GitHub', icon: '◉' },
  { name: 'Stripe', icon: 'S' },
  { name: 'Notion', icon: 'N' },
  { name: 'Figma', icon: 'F' },
  { name: 'Slack', icon: 'S' },
];

export function LandingPage() {
  const { openModal } = useUIStore();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/vibe-vault-logo.png"
                alt="Vibe Vault Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="font-bold text-xl text-gray-900">Vibe Vault</span>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="hidden sm:flex">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-white to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-violet-200/30 via-purple-200/30 to-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Your Personal Developer Knowledge Hub
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Store, Organize &{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Access
              </span>{' '}
              Your Dev Assets
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Vibe Vault is your centralized repository for code snippets, AI prompts,
              file assets, and project ideas. Everything you need, in one beautiful place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => openModal('auth')}
                className="text-lg px-8 bg-gray-900 hover:bg-gray-800 h-14"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 h-14 border-2"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500"
            >
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                No credit card required
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-2 shadow-2xl shadow-violet-500/10">
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700/50 rounded-md px-3 py-1.5 text-xs text-gray-400 text-center">
                      app.vibevault.dev/dashboard
                    </div>
                  </div>
                </div>

                {/* App preview */}
                <div className="p-6">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Sidebar */}
                    <div className="col-span-3 bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg" />
                        <div className="h-4 w-20 bg-gray-700 rounded" />
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-gray-700/50" />
                            <div className="h-3 w-16 bg-gray-700/50 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="col-span-9 space-y-4">
                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Snippets', color: 'bg-blue-500' },
                          { label: 'Prompts', color: 'bg-purple-500' },
                          { label: 'Files', color: 'bg-amber-500' },
                          { label: 'Projects', color: 'bg-emerald-500' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-xs text-gray-500 mb-2">{stat.label}</div>
                            <div className="text-2xl font-bold text-white mb-2">24</div>
                            <div className={`h-1 rounded-full ${stat.color} w-3/4`} />
                          </div>
                        ))}
                      </div>

                      {/* Chart area */}
                      <div className="bg-gray-800/50 rounded-xl p-4 h-32">
                        <div className="flex items-end justify-between h-full gap-2">
                          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-violet-500/20 to-violet-500/60 rounded-t-sm"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Recent items */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-3">Recent Activity</div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-700/50" />
                                <div className="flex-1">
                                  <div className="h-3 w-24 bg-gray-700/50 rounded mb-1" />
                                  <div className="h-2 w-16 bg-gray-700/30 rounded" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-sm text-gray-400 mb-3">Quick Actions</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-16 bg-gray-700/30 rounded-lg" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Logos Section */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider font-medium">
            Trusted by developers from leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustLogos.map((logo) => (
              <div key={logo.name} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl font-bold">{logo.icon}</span>
                <span className="font-semibold text-lg">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 text-violet-600 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
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
                  className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-br ${feature.color}`} style={{
                      color: feature.color.includes('blue') ? '#3B82F6' :
                        feature.color.includes('purple') ? '#8B5CF6' :
                          feature.color.includes('amber') ? '#F59E0B' : '#10B981'
                    }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Developers
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about Vibe Vault
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <Quote className="w-8 h-8 text-violet-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'Secure by Default' },
                  { icon: Cloud, text: 'Cloud Synced' },
                  { icon: Zap, text: 'Lightning Fast' },
                  { icon: Globe, text: 'Access Anywhere' },
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.text} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="font-medium text-gray-700">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl opacity-10 blur-2xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Vibe Vault?</h3>
                <ul className="space-y-4">
                  {[
                    'Unlimited code snippets and prompts',
                    'Drag-and-drop file uploads',
                    'Full-text search across all items',
                    'Custom tags and categories',
                    'Kanban project management',
                    'Secure cloud storage',
                  ].map((benefit, index) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gray-900 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Build Your Vault?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of developers who are already organizing their knowledge and boosting productivity.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => openModal('auth')}
                  className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 h-14"
                >
                  Get Started Free
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                No credit card required • Free forever plan available
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/vibe-vault-logo.png"
                alt="Vibe Vault Logo"
                className="w-9 h-9 object-contain"
              />
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

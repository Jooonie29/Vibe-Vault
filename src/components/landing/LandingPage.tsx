import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
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
  Quote,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Linkedin,
  Facebook
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const repoUrl = 'https://github.com/Jooonie29/Vibe-Vault.git';

const faqs = [
  {
    question: "How does Vault Vibe help organize my development workflow?",
    answer: "Vault Vibe provides a centralized hub for all your developer assets - code snippets, AI prompts, file assets, and project tracking. Everything is searchable, taggable, and accessible from anywhere."
  },
  {
    question: "Do I need a detailed setup to get started?",
    answer: "Not at all! Vault Vibe works out of the box. Simply sign up and start adding your snippets, prompts, and files. Our intuitive interface makes organization effortless."
  },
  {
    question: "Is the platform free to use for individual developers?",
    answer: "Yes! We offer a generous free plan that includes unlimited personal snippets, prompts, and file storage. Premium features are available for teams who need advanced collaboration tools."
  },
  {
    question: "Can I share my resources with team members?",
    answer: "Absolutely! Vault Vibe supports team workspaces where you can share snippets, prompts, and files with your colleagues. Set permissions and collaborate seamlessly."
  },
  {
    question: "How does the project tracking feature work?",
    answer: "Our Kanban-style project tracker lets you visualize your app ideas from concept to completion. Track progress, set priorities, and never lose track of your side projects again."
  }
];

const features = [
  {
    icon: Code2,
    title: 'Smart Code Snippets',
    description: 'Store and organize reusable code blocks with syntax highlighting for 20+ programming languages.',
  },
  {
    icon: MessageSquare,
    title: 'AI Prompt Library',
    description: 'Build your curated collection of engineered prompts for ChatGPT, Claude, and other LLMs.',
  },
  {
    icon: FolderOpen,
    title: 'File Asset Manager',
    description: 'Upload and organize design files, icons, documentation, and resources in one place.',
  },
  {
    icon: Kanban,
    title: 'Project Tracker',
    description: 'Track your app ideas from concept to completion with our intuitive Kanban board.',
  },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Snippets Saved' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started with personal projects.',
    features: [
      '3 Workspaces',
      '200MB Storage',
      'Unlimited Code Snippets',
      'Unlimited AI Prompts',
      'Community Support'
    ],
    cta: 'Current Plan',
    popular: false
  },
  {
    name: 'Pro',
    price: '$5',
    description: 'Unlock unlimited potential for growing teams.',
    features: [
        'Unlimited Workspaces',
        '10GB Storage',
        'Cloud Backup & Sync',
        'Advanced Search & Filtering',
        'Unlimited AI Prompts',
        'Unlimited Code Snippets',
        'Priority Support',
        'Shareable Links'
      ],
    cta: 'Upgrade to Pro',
    popular: true
  }
];

export function LandingPage() {
  const { openModal } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Vault Vibe" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl text-gray-900">Vault Vibe</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 py-4 px-4"
          >
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/bg-2.jpg')" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight"
            >
              The Central Vault for your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                Developer Brain
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Clean infrastructure to organize your prompts, assets, and code snippets.
              Built for the modern vibe coder who values clarity over noise.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <button
                onClick={() => openModal('auth')}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-all flex items-center gap-2">
                Book a Demo
              </button>
            </motion.div>
          </div>

          {/* Hero Visual - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative mt-8 h-[400px] max-w-5xl mx-auto"
          >
            {/* Code Snippet Card - Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute left-4 md:left-12 top-1/4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-56 md:w-64"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <Code2 className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">React Hook</div>
                  <div className="text-xs text-gray-500">useDebounce.ts</div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-600">
                <span className="text-gray-900 font-semibold">export</span>{' '}
                <span className="text-gray-900">function</span>{' '}
                <span className="text-gray-900">useDebounce</span>
                <span className="text-gray-400">{'(...)'}</span>
              </div>
            </motion.div>

            {/* Prompt Card - Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute right-4 md:right-12 top-1/3 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-56 md:w-64"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <MessageSquare className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">AI Prompt</div>
                  <div className="text-xs text-gray-500">Code Review</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 italic">
                "Review this code for performance optimization and best practices..."
              </div>
            </motion.div>

            {/* Project Card - Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-64 md:w-80"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                    <Kanban className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Mobile App</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">75%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gray-900 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Brand Marquee Section */}
      <section className="relative py-8 border-y border-gray-100 bg-white overflow-hidden" >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-40%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex items-center gap-16 pr-16"
          >
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src="/logo.png" alt="" className="w-8 h-8 object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default" />
                <span className="text-xl font-bold text-gray-400 tracking-tight">Vault Vibe</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[...Array(12)].map((_, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-4">
                <img src="/logo.png" alt="" className="w-8 h-8 object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default" />
                <span className="text-xl font-bold text-gray-400 tracking-tight">Vibe Vault</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All the Tools you need to help
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empowering you with intelligent features to simplify your development workflow and organize your digital assets.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50/50 rounded-[2.5rem] border border-white shadow-[8px_8px_16px_rgba(0,0,0,0.03),-8px_-8px_16px_rgba(255,255,255,0.8)] overflow-hidden transition-all hover:-translate-y-1"
                >
                  {/* Feature Content */}
                  <div className="p-8">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.02),-4px_-4px_10px_rgba(255,255,255,0.9)] border border-gray-100/50 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Feature Mockup */}
                  <div className="px-8 pb-8">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      {index === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <span className="ml-2 font-mono">useAuth.ts</span>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono text-xs text-gray-600">
                            <span className="text-gray-900 font-semibold">export const</span>{' '}
                            <span className="text-gray-900">useAuth</span>{' '}
                            <span className="text-gray-400">= () {'=>'} {'{'}</span>
                            <br />
                            <span className="text-gray-400 pl-4">...</span>
                            <br />
                            <span className="text-gray-400">{'}'}</span>
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">Refactor Code</div>
                          </div>
                          <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-600 italic">
                            "Refactor this component to use React hooks and improve performance..."
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-gray-500">React</span>
                            <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-gray-500">Performance</span>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.02),-4px_-4px_10px_rgba(255,255,255,0.9)] border border-gray-100 rounded-2xl flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-gray-900" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="text-sm font-semibold text-gray-900">design-system.fig</div>
                            <div className="text-xs text-gray-400">2.4 MB • Updated yesterday</div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="w-2/3 h-full bg-gray-900 rounded-full" />
                            </div>
                          </div>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-gray-900">Project Board</div>
                            <button className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full">New Task</button>
                          </div>
                          <div className="space-y-2">
                            {['Design System', 'API Integration', 'User Testing'].map((task, i) => (
                              <div key={task} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-gray-200' : 'bg-gray-900'}`} />
                                <span className="text-sm font-medium text-gray-700 flex-1">{task}</span>
                                <span className={`text-[10px] font-bold uppercase transition-colors ${i === 2 ? 'text-gray-400' : 'text-gray-900'}`}>{i === 0 ? 'Done' : i === 1 ? 'In Progress' : 'Todo'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upgrade your workspace</h2>
            <p className="text-lg text-gray-600 mb-8">Choose the plan that fits your needs. Scale as you grow.</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <div className="bg-gray-50 p-1 rounded-full border border-gray-100 flex items-center shadow-inner">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${billingCycle === 'monthly'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'quarterly'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Quarterly
                  <span className={`text-[10px] ${billingCycle === 'quarterly' ? 'text-violet-200' : 'text-gray-400'}`}>(-10%)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col p-8 rounded-[2.5rem] bg-gray-50/50 border border-white shadow-[8px_8px_16px_rgba(0,0,0,0.03),-8px_-8px_16px_rgba(255,255,255,0.8)] overflow-hidden ${plan.popular ? 'ring-2 ring-violet-500/10 scale-105 z-10' : ''}`}
              >
                {/* Badge/Label */}
                <div className="absolute top-4 left-8">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${plan.popular
                    ? 'bg-violet-600 text-white border-violet-500'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                    {plan.name === 'Enterprise' ? 'ENTERPRISE' : plan.popular ? 'PRO' : 'FREE'}
                  </span>
                </div>

                <div className="mt-8 mb-8 text-center md:text-left">
                  <div className="flex items-baseline gap-1 mb-2 justify-center md:justify-start">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 flex items-center justify-center shrink-0">
                        <Check className={`w-4 h-4 ${plan.popular ? 'text-violet-600' : 'text-gray-400'}`} />
                      </div>
                      <span className="text-gray-600 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openModal('auth')}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700'
                    : 'bg-white text-gray-900 border border-gray-100 shadow-sm hover:bg-gray-50'
                    }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* FAQ Header */}
            <div className="lg:col-span-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">FAQ</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Know
              </h2>
              <p className="text-gray-600 mb-6">
                Still have questions? Reach out to our customer service team.
              </p>
              <button className="text-sm font-medium text-gray-900 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                Contact us
              </button>
            </div>

            {/* FAQ Accordion */}
            <div className="lg:col-span-2 space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-8">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Footer Section */}
      <section className="pt-20 pb-8 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* CTA Box */}
          <div className="relative overflow-hidden bg-[#0A0C14] rounded-[3rem] p-12 md:p-24 text-center mb-24">
            {/* Abstract Background Circles */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Build your personal infrastructure.
              </motion.h2>
              <p className="text-gray-400 mb-10 text-lg">
                Stop scattered snippets and lost prompts. Move your creative assets into
                a central repository designed for high-performance development.
              </p>
              <button
                onClick={() => openModal('auth')}
                className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-full font-semibold transition-all shadow-lg shadow-violet-500/20"
              >
                Get Started Free
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 px-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="Vault Vibe" className="w-8 h-8 object-contain" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">Vault Vibe</span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                Architectural asset management for vibe coders.
                Keep your prompts and code intelligently organized.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Products</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">Features</a></li>
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">Pricing</a></li>
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">About Us</a></li>
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">Blog</a></li>
                <li><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-violet-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-6">
              <a href={repoUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://github.com/Jooonie29" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 Vault Vibe. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

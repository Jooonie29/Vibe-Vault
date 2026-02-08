import React from 'react';
import { Book, Code, Database, Shield, Zap, Server, Layout, FileText } from 'lucide-react';

export const Documentation = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-lg">
          Technical specifications, architecture details, and implementation guidelines for Vault Vibe.
        </p>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocCard 
          icon={Server} 
          title="System Architecture" 
          description="React + Vite frontend with Convex serverless backend."
        />
        <DocCard 
          icon={Database} 
          title="Database Schema" 
          description="Profiles, Items, Projects, Teams, and Shares tables."
        />
        <DocCard 
          icon={Shield} 
          title="Security & Auth" 
          description="RBAC, Row Level Security, and Supabase Authentication."
        />
        <DocCard 
          icon={Zap} 
          title="API & Data Flow" 
          description="Real-time synchronization and optimistic updates."
        />
        <DocCard 
          icon={Layout} 
          title="Frontend Structure" 
          description="Component hierarchy, state management, and routing."
        />
        <DocCard 
          icon={FileText} 
          title="Advanced Features" 
          description="Offline support, PWA, and browser extensions."
        />
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <Section title="1. Executive Summary">
            <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
              Vault Vibe is a comprehensive SaaS productivity platform designed specifically for "vibe coding" workflows. 
              It enables developers and creative technologists to efficiently store, organize, retrieve, and share AI prompts, 
              code snippets, and knowledge resources.
            </p>
          </Section>

          <div className="h-px bg-gray-100 dark:bg-white/10" />

          <Section title="2. System Architecture">
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              Vault Vibe utilizes a modern, serverless architecture leveraging <strong>Convex</strong> for the backend/database 
              and <strong>React (Vite)</strong> for the frontend, ensuring sub-200ms response times and real-time synchronization.
            </p>
            <div className="bg-gray-50 dark:bg-muted/30 rounded-xl p-4 border border-gray-100 dark:border-white/10">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tech Stack</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong>Frontend:</strong> React 18, Vite, Tailwind CSS
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <strong>Backend:</strong> Convex (BaaS)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <strong>Auth:</strong> Supabase Auth
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <strong>State:</strong> Zustand + React Query
                </li>
              </ul>
            </div>
          </Section>

          <div className="h-px bg-gray-100 dark:bg-white/10" />

          <Section title="3. Database Schema">
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              The database is implemented using Convex, providing strong consistency and real-time updates.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SchemaTable 
                name="items" 
                description="Central repository for prompts, code, and files."
                fields={['userId', 'type', 'title', 'content', 'language', 'category']}
              />
              <SchemaTable 
                name="projects" 
                description="Kanban-style project management entities."
                fields={['teamId', 'status', 'progress', 'priority', 'dueDate']}
              />
              <SchemaTable 
                name="teams" 
                description="Multi-tenancy and organization groups."
                fields={['name', 'createdBy', 'isPersonal', 'members']}
              />
              <SchemaTable 
                name="profiles" 
                description="User profile information."
                fields={['userId', 'username', 'fullName', 'avatarUrl']}
              />
            </div>
          </Section>
          
          <div className="h-px bg-gray-100" />

          <Section title="4. Implementation Guidelines">
             <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <h4 className="font-semibold mb-1">Offline Capability</h4>
                    <p className="text-sm">
                        Implement service workers using <code>vite-plugin-pwa</code> and leverage Convex's optimistic updates 
                        for robust offline support.
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                    <h4 className="font-semibold mb-1">Browser Extension</h4>
                    <p className="text-sm">
                        Use <code>window.postMessage</code> for communication between the web app and extension content scripts.
                        Share auth tokens securely via cookies or explicit exchange.
                    </p>
                </div>
             </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

const DocCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white dark:bg-card p-5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-300" />
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-muted-foreground">{description}</p>
  </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
    {children}
  </div>
);

const SchemaTable = ({ name, description, fields }: { name: string, description: string, fields: string[] }) => (
    <div className="border border-gray-200 dark:border-white/10 rounded-lg p-4">
        <h4 className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400 mb-1">{name}</h4>
        <p className="text-xs text-gray-500 dark:text-muted-foreground mb-3">{description}</p>
        <div className="flex flex-wrap gap-1">
            {fields.map(f => (
                <span key={f} className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded text-[10px] font-mono">
                    {f}
                </span>
            ))}
        </div>
    </div>
);

import React from 'react';
import { Users, Github, Twitter, MessageCircle, Heart, Globe } from 'lucide-react';

const repoUrl = 'https://github.com/Jooonie29/Vibe-Vault.git';

export const Community = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join the Vault Vibe Community</h1>
        <p className="text-gray-500 dark:text-muted-foreground text-lg">
          Connect with thousands of developers, share your prompts, and build the future of coding together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Discord */}
        <CommunityCard 
            icon={MessageCircle}
            color="bg-[#5865F2]"
            title="Discord Server"
            members="12.5k Members"
            description="Chat with the team, get help, and showcase your projects."
            action="Join Server"
            href={repoUrl}
        />
        
        {/* Twitter */}
        <CommunityCard 
            icon={Twitter}
            color="bg-[#1DA1F2]"
            title="Twitter / X"
            members="@vibevault"
            description="Follow us for the latest updates, tips, and feature drops."
            action="Follow Us"
            href={repoUrl}
        />

        {/* GitHub */}
        <CommunityCard 
            icon={Github}
            color="bg-[#24292e]"
            title="GitHub"
            members="Open Source"
            description="Contribute to the codebase, report bugs, or request features."
            action="Star Repo"
            href="https://github.com/Jooonie29"
        />
      </div>

      <div className="mt-12 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold">Community Showcase</h3>
                <p className="text-violet-100 max-w-md">
                    See what others are building with Vault Vibe. Explore our gallery of community-created prompts and workflows.
                </p>
            </div>
            <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-white text-violet-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
                Explore Showcase
            </a>
        </div>
      </div>
    </div>
  );
};

const CommunityCard = ({ icon: Icon, color, title, members, description, action, href }: any) => (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all group">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">{members}</p>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mb-6 leading-relaxed">
            {description}
        </p>
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm inline-flex items-center justify-center"
        >
            {action}
        </a>
    </div>
);

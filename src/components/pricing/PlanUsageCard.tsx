import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, ChevronRight, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingModal } from '@/components/pricing/PricingModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PlanUsageCardProps {
  workspacesUsed: number;
  workspacesLimit: number;
  storageUsed: number;
  storageLimit: number;
  isPro?: boolean;
}

export function PlanUsageCard({
  workspacesUsed,
  workspacesLimit,
  storageUsed,
  storageLimit,
  isPro = false
}: PlanUsageCardProps) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const workspacesPercent = Math.min((workspacesUsed / workspacesLimit) * 100, 100);
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  // Pro theme styles
  const cardBg = isPro 
    ? "bg-black" 
    : "bg-gradient-to-br from-black via-violet-950 to-violet-800";
    
  const accentColor = isPro ? "text-orange-500" : "text-violet-400";
  const iconColor = isPro ? "text-orange-500" : "text-amber-300";
  const barGradient = isPro 
    ? "from-orange-500 to-amber-500" 
    : "from-amber-300 to-orange-400";

  return (
    <>
      <div className={`${cardBg} rounded-2xl p-4 shadow-xl shadow-black/40 mb-4 border border-violet-500/30 overflow-hidden relative group transition-colors duration-300`}>
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Zap className={`w-16 h-16 ${accentColor}`} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white mb-3">
            <Crown className={`w-4 h-4 ${iconColor}`} />
            <h3 className="text-xs font-bold">{isPro ? 'Pro Plan Active' : 'Free Plan Limits'}</h3>
          </div>

          <div className="w-full space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                <span>Workspaces</span>
                <span>{workspacesUsed}/{isPro ? '∞' : workspacesLimit}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                <motion.div
                  animate={{ width: isPro ? '100%' : `${workspacesPercent}%` }}
                  className={`h-full bg-gradient-to-r ${barGradient} rounded-full`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                <span>Storage</span>
                <span>{storageUsed}MB / {isPro ? '∞' : `${storageLimit}MB`}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isPro ? '100%' : `${storagePercent}%` }}
                  className={`h-full bg-gradient-to-r ${isPro ? 'from-orange-500 to-amber-500' : 'from-emerald-300 to-teal-400'} rounded-full`}
                />
              </div>
            </div>
          </div>

          {!isPro && (
            <div className="grid grid-cols-1 gap-2 mt-4 pt-1">
              <button
                onClick={() => setShowLearnMore(true)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors border border-white/10 backdrop-blur-sm"
              >
                Learn more
              </button>
              <PricingModal trigger={
                <button className="w-full py-2 bg-white text-violet-600 text-[10px] font-bold rounded-lg hover:bg-violet-50 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-black/10">
                  Upgrade plan
                  <ChevronRight className="w-3 h-3" />
                </button>
              } />
            </div>
          )}
        </div>
      </div>

      {/* Learn More Dialog */}
      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-md bg-card rounded-[32px] p-0 overflow-hidden shadow-2xl border-0">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-card-foreground tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              Free Plan Limits
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-2 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              You're currently on the Free plan. Here's your current usage to help you manage your resources.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">Workspaces</span>
                  <span className="text-sm font-bold text-foreground">{workspacesUsed}/{workspacesLimit}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${workspacesPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">Storage</span>
                  <span className="text-sm font-bold text-foreground">{storageUsed}MB / {storageLimit}MB</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercent}%` }}
                    className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-500" />
                Pro Features
              </h4>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  'Unlimited Workspaces',
                  '10GB Storage',
                  'Cloud Backup & Sync',
                  'Advanced Search & Filtering',
                  'Unlimited AI Prompts',
                  'Unlimited Code Snippets',
                  'Priority Support',
                  'Shareable Links'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <PricingModal trigger={
              <Button
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-violet-600/20 mt-2"
                onClick={() => setShowLearnMore(false)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            } />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
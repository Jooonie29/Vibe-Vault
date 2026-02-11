import React, { useMemo, useState } from 'react';
import { Gift, Copy, Check, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export const Referral = () => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const { user, profile } = useAuthStore();
  const referralCode = useMemo(() => {
    if (profile?.referralCode) {
      return profile.referralCode;
    }
    const raw =
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      user?.id ||
      'invite';
    return encodeURIComponent(String(raw).trim().toLowerCase().replace(/\s+/g, ''));
  }, [profile?.referralCode, user]);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://vaultvibe.xyz'}/r/${referralCode}`;
  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailInvite = () => {
    if (!isValidEmail) return;
    const subject = encodeURIComponent('Join me on Vault Vibe');
    const body = encodeURIComponent(
      `I’m using Vault Vibe to save and organize code snippets and AI prompts. Join with this link: ${referralLink}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setEmail('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 md:p-12 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/30">
                <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Invite Friends, Get Pro Free</h1>
            <p className="text-violet-100 text-lg max-w-lg mx-auto">
                Give your friends 1 month of Vault Vibe Pro for free. For every friend who joins, you get 1 month free too!
            </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
            {/* Link Copy Section */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Share your unique link</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-sm truncate">
                        {referralLink}
                    </div>
                    <Button onClick={handleCopy} className={`min-w-[100px] ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-card px-2 text-gray-500 dark:text-muted-foreground">Or invite by email</span>
                </div>
            </div>

            {/* Email Invite */}
            <div className="flex gap-2">
                <input 
                    type="email" 
                    placeholder="Enter friend's email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
                <Button
                  variant="secondary"
                  onClick={handleEmailInvite}
                  disabled={!isValidEmail}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-white/10">
                <StatBox label="Friends Invited" value="0" />
                <StatBox label="Clicks" value="0" />
                <StatBox label="Months Earned" value="0" />
            </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500 dark:text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
    </div>
);

import React, { useMemo, useState } from 'react';
import { Gift, Copy, Check, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const Referral = () => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const { user, profile } = useAuthStore();
  const referrals = useQuery(api.referrals.getReferralsForUser, user?.id ? { userId: user.id } : "skip");
  const referredProfiles = useQuery(
    api.profiles.getProfilesByUserIds,
    referrals?.length ? { userIds: referrals.map((ref) => ref.referredUserId) } : "skip"
  );
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
    const base = String(raw)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 16);
    const suffix = user?.id ? user.id.slice(-6).toLowerCase() : '';
    return encodeURIComponent(`${base || 'user'}${suffix ? `-${suffix}` : ''}`);
  }, [profile?.referralCode, user]);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://vaultvibe.xyz'}/r/${referralCode}`;
  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const referralsList = useMemo(() => referrals || [], [referrals]);
  const profileMap = useMemo(() => {
    const map = new Map<string, any>();
    (referredProfiles || []).forEach((p: any) => map.set(p.userId, p));
    return map;
  }, [referredProfiles]);
  const monthsEarned = Math.min(referralsList.length, 2);

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
                <StatBox label="Friends Invited" value={String(referralsList.length)} />
                <StatBox label="Clicks" value={String(referralsList.length)} />
                <StatBox label="Months Earned" value={String(monthsEarned)} />
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Signups</h3>
                {referralsList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No referrals yet.</div>
                ) : (
                  <div className="space-y-2">
                    {referralsList.map((ref) => {
                      const profile = profileMap.get(ref.referredUserId);
                      const label = profile?.fullName || profile?.username || profile?.email || 'New user';
                      return (
                        <div
                          key={ref._id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
                            <span className="text-xs text-muted-foreground">
                              Joined {new Date(ref.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+1 month</span>
                        </div>
                      );
                    })}
                  </div>
                )}
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

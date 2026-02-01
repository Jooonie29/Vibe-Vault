import React, { useState } from 'react';
import { Gift, Copy, Check, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Referral = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://vibevault.app/r/johndoe123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 md:p-12 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/30">
                <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Invite Friends, Get Pro Free</h1>
            <p className="text-violet-100 text-lg max-w-lg mx-auto">
                Give your friends 1 month of Vibe Vault Pro for free. For every friend who joins, you get 1 month free too!
            </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
            {/* Link Copy Section */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Share your unique link</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate">
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
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or invite by email</span>
                </div>
            </div>

            {/* Email Invite */}
            <div className="flex gap-2">
                <input 
                    type="email" 
                    placeholder="Enter friend's email address" 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
                <Button variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
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
    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
    </div>
);

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Settings,
    BookOpen,
    HelpCircle,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface UserProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement>;
}

export function UserProfileDropdown({ isOpen, onClose, anchorRef }: UserProfileDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { signOut: clerkSignOut } = useAuth();
    const { user, profile, signOut: clearAuthStore } = useAuthStore();
    const { setCurrentView, setActiveTeamId } = useUIStore();

    const displayName = profile?.fullName || profile?.username || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                anchorRef?.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    const handleNavigate = (section: string) => {
        onClose();
        // Navigate to the appropriate section in the TeamOnboarding sidebar
        const event = new CustomEvent('navigate-section', { detail: section });
        window.dispatchEvent(event);
    };

    const handleSignOut = async () => {
        onClose();
        await clerkSignOut();
        await clearAuthStore();
        setActiveTeamId(null);
        setCurrentView('dashboard');
    };

    const menuItems = [
        {
            id: 'documentation',
            label: 'Documentation',
            icon: BookOpen,
            description: 'Learn how to use Vault Vibe'
        },
        {
            id: 'help',
            label: 'Help Center',
            icon: HelpCircle,
            description: 'Get support and FAQs'
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                    <img
                                        src={user?.imageUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                                <p className="text-sm text-gray-500 truncate">{email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                        <Icon className="w-4.5 h-4.5 text-gray-600 group-hover:text-violet-600 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mx-2" />

                    {/* Sign Out */}
                    <div className="p-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 transition-colors group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <LogOut className="w-4.5 h-4.5 text-gray-600 group-hover:text-red-600 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Sign Out</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

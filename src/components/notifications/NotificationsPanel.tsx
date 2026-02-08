import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Users,
    Folder,
    Share2,
    Mail
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatDistanceToNow } from 'date-fns';
import { Id } from '../../../convex/_generated/dataModel';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement>;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'invite':
            return Mail;
        case 'team':
            return Users;
        case 'project':
            return Folder;
        case 'share':
            return Share2;
        default:
            return Bell;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'invite':
            return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'team':
            return 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
        case 'project':
            return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'share':
            return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
};

export function NotificationsPanel({ isOpen, onClose, anchorRef }: NotificationsPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const userId = user?.id || '';

    const notifications = useQuery(
        api.notifications.getNotifications,
        userId ? { userId } : 'skip'
    );

    const markRead = useMutation(api.notifications.markNotificationRead);
    const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
    const respondToInvite = useMutation(api.teams.respondToInvite);
    const { addToast, setActiveTeamId } = useUIStore(); // Assuming this store exists

    const unreadCount = notifications?.filter((n) => !n.read).length || 0;

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
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

    const handleMarkRead = async (id: Id<"notifications">) => {
        if (!userId) return;
        try {
            await markRead({ id, userId });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (!userId) return;
        try {
            await markAllRead({ userId });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleRespondToInvite = async (inviteId: any, accept: boolean, notificationId: any) => {
        if (!userId) return;
        try {
            const teamId = await respondToInvite({
                inviteId,
                accept,
                userId,
            });
            await markRead({ id: notificationId, userId });
            if (accept && teamId) {
                setActiveTeamId(teamId as any);
            }
            addToast({
                type: accept ? 'success' : 'info',
                title: accept ? 'Invitation Accepted' : 'Invitation Declined',
                message: accept ? 'You have joined the team.' : 'You declined the invitation.'
            });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Error', message: error.message });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 right-0 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications === undefined ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 dark:border-violet-400"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No notifications yet</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-1">
                                    You'll see team invites and updates here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {notifications.map((notification) => {
                                    const Icon = getNotificationIcon(notification.type);
                                    const colorClass = getNotificationColor(notification.type);

                                    return (
                                        <button
                                            key={notification._id}
                                            onClick={() => !notification.read && handleMarkRead(notification._id)}
                                            className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                
                                                {/* Invite Actions */}
                                                {notification.type === 'invite' && notification.metadata?.inviteId && !notification.read && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRespondToInvite(notification.metadata.inviteId, true, notification._id);
                                                            }}
                                                            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRespondToInvite(notification.metadata.inviteId, false, notification._id);
                                                            }}
                                                            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

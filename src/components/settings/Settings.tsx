import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  Save,
  Mail,
  Shield,
  Palette,
  Bell,
  Trash2,
  LogOut,
  Check
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Settings() {
  const { signOut: clerkSignOut } = useAuth();
  const { user, profile, updateProfile, signOut: clearAuthStore } = useAuthStore();
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.id || "";

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    fullName: profile?.fullName || '',
  });

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const markNotificationRead = useMutation(api.notifications.markNotificationRead);
  const markAllNotificationsRead = useMutation(api.notifications.markAllNotificationsRead);

  const handleSignOut = async () => {
    await clerkSignOut();
    await clearAuthStore();
  };

  const notifications = useQuery(api.notifications.getNotifications, { userId });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // Step 1: Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Step 3: Update profile in Convex
      await updateProfile({ avatarUrl: storageId });
      addToast({ type: 'success', title: 'Avatar updated', message: 'Your profile picture has been updated.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Upload failed', message: error.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      addToast({ type: 'success', title: 'Profile saved', message: 'Your changes have been saved.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };


  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead({ userId: user.id });
      addToast({ type: 'success', title: 'Notifications cleared', message: 'All notifications marked as read.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to update notifications', message: error.message });
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    try {
      await markNotificationRead({ id: id as any, userId: user.id });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Unable to update notification', message: error.message });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-600" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.id}`} alt="Default Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveProfile} loading={loading} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Security Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600" />
          Security
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Last changed: Never</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-600" />
          Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <h4 className="font-medium text-gray-900">Theme</h4>
              <p className="text-sm text-gray-500">Choose your preferred theme</p>
            </div>
            <select className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500">Receive email notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-600" />
            Activity
          </h2>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleMarkRead(notification._id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${notification.read ? 'bg-white border-gray-200' : 'bg-violet-50 border-violet-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                  </div>
                  {!notification.read ? <Check className="w-4 h-4 text-violet-500" /> : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No activity yet.</p>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50">
            <div>
              <h4 className="font-medium text-gray-900">Sign Out</h4>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50">
            <div>
              <h4 className="font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

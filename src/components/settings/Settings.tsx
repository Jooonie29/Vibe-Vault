import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useAuth, useUser } from '@clerk/clerk-react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/components/theme-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Settings() {
  const { signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { theme, setTheme } = useTheme();
  const { user, profile, updateProfile, signOut: clearAuthStore } = useAuthStore();
  const { addToast, setActiveTeamId, setCurrentView } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.id || "";

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
  });
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    if (clerkUser?.fullName) return clerkUser.fullName;
    const first = clerkUser?.firstName || '';
    const last = clerkUser?.lastName || '';
    const combined = `${first} ${last}`.trim();
    if (combined) return combined;
    return profile?.username || clerkUser?.username || '';
  }, [profile?.fullName, profile?.username, clerkUser?.fullName, clerkUser?.firstName, clerkUser?.lastName, clerkUser?.username]);

  const displayUsername = useMemo(() => {
    return profile?.username || clerkUser?.username || clerkUser?.firstName || '';
  }, [profile?.username, clerkUser?.username, clerkUser?.firstName]);

  const emailAddress = clerkUser?.primaryEmailAddress?.emailAddress || user?.email || '';
  const canChangePassword = !!clerkUser?.passwordEnabled;

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const markNotificationRead = useMutation(api.notifications.markNotificationRead);
  const markAllNotificationsRead = useMutation(api.notifications.markAllNotificationsRead);
  const deleteAccountData = useMutation(api.account.deleteAccountData);

  const handleSignOut = async () => {
    await clerkSignOut();
    await clearAuthStore();
    setActiveTeamId(null);
    setCurrentView('dashboard');
  };
  const handleDeleteAccount = async () => {
    if (!userId || !clerkUser) return;
    setDeleteLoading(true);
    try {
      await deleteAccountData({ userId });
      await clerkUser.delete();
      await clearAuthStore();
      setActiveTeamId(null);
      setCurrentView('dashboard');
      addToast({ type: 'success', title: 'Account deleted', message: 'Your account has been removed.' });
      window.location.href = '/';
    } catch (error: any) {
      addToast({ type: 'error', title: 'Delete failed', message: error?.message || 'Unable to delete account.' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteOpen(false);
    }
  };

  const notifications = useQuery(api.notifications.getNotifications, { userId });

  useEffect(() => {
    setFormData({
      username: displayUsername,
      fullName: displayName,
    });
  }, [displayName, displayUsername]);

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

  const handlePasswordChange = async () => {
    if (!clerkUser) return;
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast({ type: 'error', title: 'Missing fields', message: 'Enter your current and new password.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ type: 'error', title: 'Passwords do not match', message: 'Confirm your new password.' });
      return;
    }
    setPasswordLoading(true);
    try {
      await clerkUser.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      addToast({ type: 'success', title: 'Password updated', message: 'Your password has been changed.' });
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Password update failed', message: error?.errors?.[0]?.message || error.message || 'Unable to update password.' });
    } finally {
      setPasswordLoading(false);
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
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
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
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-background rounded-xl shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-muted-foreground" />
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
            <h3 className="font-semibold text-foreground">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{emailAddress}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
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
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600" />
          Security
        </h2>

        <div className="space-y-4">
          {canChangePassword && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
              <div>
                <h4 className="font-medium text-foreground">Password</h4>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPasswordOpen(true)}>
                Change Password
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
            <div>
              <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-600" />
          Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
            <div>
              <h4 className="font-medium text-foreground">Theme</h4>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <select
              className="px-3 py-2 rounded-xl bg-background border border-border text-sm font-medium text-foreground"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-foreground">Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive email notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </Card>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsPasswordOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange} loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
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
                className={`w-full text-left p-4 rounded-xl border transition-colors ${notification.read ? 'bg-background border-border' : 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-900/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.read ? <Check className="w-4 h-4 text-violet-500" /> : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-6 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-transparent dark:border-red-900/30">
            <div>
              <h4 className="font-medium text-foreground">Sign Out</h4>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-transparent dark:border-red-900/30">
            <div>
              <h4 className="font-medium text-foreground">Delete Account</h4>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Delete account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-500 dark:text-muted-foreground mt-2">
              This action cannot be undone. Your account and all data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel disabled={deleteLoading} className="rounded-2xl font-bold py-6 border-gray-200 dark:border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleteLoading}
              className="rounded-2xl font-black py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
            >
              {deleteLoading ? 'Deleting...' : 'Delete account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

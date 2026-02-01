import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type AuthView = 'login' | 'register' | 'forgot';

export function AuthModal() {
  const { activeModal, closeModal, addToast, modalData } = useUIStore();
  const { signIn, signUp, setUser, setSession, setProfile, triggerPostAuthLoading, postAuthLoading } = useAuthStore();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOpen = activeModal === 'auth' && !postAuthLoading;

  useEffect(() => {
    if (!isOpen) return;
    const nextView = modalData?.view;
    if (nextView === 'login' || nextView === 'register' || nextView === 'forgot') {
      setView(nextView);
    }
  }, [isOpen, modalData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!postAuthLoading || activeModal !== 'auth') return;
    closeModal();
    setView('login');
    setFormData({ email: '', password: '', username: '', confirmPassword: '' });
    setErrors({});
  }, [postAuthLoading, activeModal, closeModal]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (view !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (view === 'register') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (view === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        addToast({ type: 'success', title: 'Welcome back!', message: 'You have been signed in.' });
        closeModal();
      } else if (view === 'register') {
        const { error } = await signUp(formData.email, formData.password, formData.username);
        if (error) throw error;
        addToast({ type: 'success', title: 'Account created!', message: 'Please check your email to verify your account.' });
        closeModal();
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest_user_id',
      email: 'guest@vibevault.dev',
      user_metadata: { full_name: 'Guest User' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any;

    const guestSession = {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: guestUser,
    } as any;

    const guestProfile = {
      id: 'guest_user_id',
      userId: 'guest_user_id',
      username: 'guest',
      fullName: 'Guest User',
      avatarUrl: null,
      _creationTime: Date.now(),
    };

    setUser(guestUser);
    setSession(guestSession);
    setProfile(guestProfile);
    triggerPostAuthLoading();

    addToast({
      type: 'info',
      title: 'Guest Mode',
      message: 'You are browsing as a guest. Data will not be saved permanently.'
    });
    closeModal();
  };

  const handleClose = () => {
    closeModal();
    setView('login');
    setFormData({ email: '', password: '', username: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <img src="/Vibe%20Vault%20logo-white.png" alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Vibe Vault</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {view === 'login' && 'Sign in to continue'}
                    {view === 'register' && 'Create your account'}
                    {view === 'forgot' && 'Reset password'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              {view === 'register' && (
                <Input
                  label="Username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={errors.username}
                  icon={<User className="w-5 h-5" />}
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
              />

              {view !== 'forgot' && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                />
              )}

              {view === 'register' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  icon={<Lock className="w-5 h-5" />}
                />
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {view === 'login' && 'Sign In'}
                {view === 'register' && 'Create Account'}
                {view === 'forgot' && 'Send Reset Link'}
              </Button>

              {view === 'login' && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
              )}

              {view === 'login' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGuestLogin}
                  className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  icon={<User className="w-4 h-4" />}
                >
                  Continue as Guest
                </Button>
              )}

              {/* Footer Links */}
              <div className="text-center space-y-2 pt-2">
                {view === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Forgot your password?
                    </button>
                    <p className="text-sm text-gray-500">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setView('register')}
                        className="text-violet-600 font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                )}
                {view === 'register' && (
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-violet-600 font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {view === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-sm text-violet-600 font-medium hover:underline"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

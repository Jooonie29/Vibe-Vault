import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { useTheme } from '@/components/theme-provider';

export function SettingsPage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your profile, security, and preferences.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border-none bg-transparent",
              navbar: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              viewSection: "p-6 space-y-6",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              formFieldInput: "bg-background border-input text-foreground",
              formFieldLabel: "text-foreground",
              profileSectionTitleText: "text-foreground font-bold text-lg",
              userPreviewMainIdentifier: "text-foreground font-bold",
              userPreviewSecondaryIdentifier: "text-muted-foreground",
            },
            variables: {
              colorBackground: theme === 'dark' ? '#0f1115' : '#ffffff',
              colorText: theme === 'dark' ? '#ffffff' : '#0f172a',
              colorInputBackground: theme === 'dark' ? '#1e293b' : '#ffffff',
              colorInputText: theme === 'dark' ? '#ffffff' : '#0f172a',
            }
          }}
        />
      </div>
    </div>
  );
}

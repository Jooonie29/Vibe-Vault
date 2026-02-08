import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.profiles.syncUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Get the best available email
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress;
      
      // Only sync if we actually have an email
      if (email) {
        syncUser({
          userId: user.id,
          email: email,
          fullName: user.fullName || undefined,
          avatarUrl: user.imageUrl || undefined,
        }).catch(console.error);
      }
    }
  }, [isLoaded, user, syncUser]);

  return null;
}

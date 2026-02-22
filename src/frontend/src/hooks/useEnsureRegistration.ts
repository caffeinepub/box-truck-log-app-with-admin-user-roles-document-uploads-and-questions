import { useEffect, useState } from 'react';
import { useLocalActor } from './useLocalActor';
import { useLocalAuth } from './useLocalAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../backend';

/**
 * Hook that ensures the authenticated user is registered with the backend
 * before allowing protected queries to run. This prevents authorization errors
 * during the initialization/registration flow.
 */
export function useEnsureRegistration() {
  const { actor, isAuthenticated } = useLocalActor();
  const { displayName } = useLocalAuth();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<Error | null>(null);

  // Check if user has a profile (which indicates registration)
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['registrationCheck'],
    queryFn: async () => {
      if (!actor || !isAuthenticated) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        // If we get an auth error, user is not registered
        const err = error as Error;
        if (err.message.includes('Unauthorized') || err.message.includes('not registered')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && isAuthenticated,
    retry: false,
    staleTime: 0, // Always check fresh on mount
  });

  // Auto-register if authenticated but no profile exists
  useEffect(() => {
    const attemptRegistration = async () => {
      if (!actor || !isAuthenticated || isRegistering || registrationError) {
        return;
      }

      // If profile query has completed and returned null, user needs registration
      if (profileQuery.isFetched && profileQuery.data === null && displayName) {
        setIsRegistering(true);
        try {
          await actor.registerUser(displayName);
          // Invalidate all queries after successful registration
          queryClient.invalidateQueries({ queryKey: ['registrationCheck'] });
          queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        } catch (error) {
          const err = error as Error;
          // Only set error if it's not "already registered"
          if (!err.message.includes('already registered')) {
            setRegistrationError(err);
          } else {
            // If already registered, just refetch profile
            queryClient.invalidateQueries({ queryKey: ['registrationCheck'] });
          }
        } finally {
          setIsRegistering(false);
        }
      }
    };

    attemptRegistration();
  }, [actor, isAuthenticated, profileQuery.isFetched, profileQuery.data, displayName, isRegistering, registrationError, queryClient]);

  return {
    isReady: isAuthenticated && profileQuery.isFetched && (profileQuery.data !== null || isRegistering),
    isRegistering,
    registrationError,
    isCheckingRegistration: profileQuery.isLoading || profileQuery.isFetching,
  };
}

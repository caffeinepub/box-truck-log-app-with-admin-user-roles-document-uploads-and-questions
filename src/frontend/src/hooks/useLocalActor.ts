import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { useLocalAuth } from './useLocalAuth';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_QUERY_KEY = 'local-actor';

export function useLocalActor() {
  const { identity, isAuthenticated } = useLocalAuth();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter('caffeineAdminToken') || '';
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    staleTime: Infinity,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isAuthenticated,
  };
}

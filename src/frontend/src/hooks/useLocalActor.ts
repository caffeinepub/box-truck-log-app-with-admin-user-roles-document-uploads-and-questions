import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useLocalAuth } from "./useLocalAuth";

const ACTOR_QUERY_KEY = "local-actor";

export function useLocalActor() {
  const { identity, isAuthenticated } = useLocalAuth();
  const queryClient = useQueryClient();
  const [isActorReady, setIsActorReady] = useState(false);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity) {
        // Return anonymous actor if not authenticated
        const anonymousActor = await createActorWithConfig();
        setIsActorReady(false); // Anonymous actor is not "ready" for protected operations
        return anonymousActor;
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      setIsActorReady(true); // Authenticated actor is ready
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data && isActorReady) {
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
  }, [actorQuery.data, isActorReady, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isAuthenticated,
    isActorReady: isAuthenticated && isActorReady, // Only ready when authenticated AND actor is initialized
  };
}

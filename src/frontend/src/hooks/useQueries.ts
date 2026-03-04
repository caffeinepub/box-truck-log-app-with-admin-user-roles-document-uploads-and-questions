import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ChecklistConfig,
  ChecklistSubmission,
  LogEntry,
  PreTripChecklist,
  Question,
  QuestionStatus,
  SavedChecklist,
  UploadReference,
  UserProfile,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { getAuthErrorMessage, isAuthorizationError } from "../utils/authErrors";
import { useLocalActor } from "./useLocalActor";

// User Registration
export function useRegisterUser() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerUser(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["registrationCheck"] });
      toast.success("Registration successful");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && isActorReady && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getUserProfile(user);
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Profile saved successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

// Authorization Queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

// Log Entry Queries
export function useGetCallerLogEntries() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<LogEntry[]>({
    queryKey: ["callerLogEntries"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCallerLogEntries();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useGetAllLogEntries() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<[Principal, LogEntry[]][]>({
    queryKey: ["allLogEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLogEntries();
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useCreateLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      notes,
      mileage,
    }: { title: string | null; notes: string; mileage: bigint | null }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createLogEntry(title, notes, mileage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerLogEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allLogEntries"] });
      toast.success("Log entry created successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

export function useUpdateLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      title,
      notes,
      mileage,
    }: {
      logId: string;
      title: string | null;
      notes: string;
      mileage: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLogEntry(logId, title, notes, mileage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerLogEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allLogEntries"] });
      toast.success("Log entry updated successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

export function useDeleteLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteLogEntry(logId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerLogEntries"] });
      queryClient.invalidateQueries({ queryKey: ["allLogEntries"] });
      toast.success("Log entry deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

// Document Upload Queries
export function useGetCallerUploads() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<UploadReference[]>({
    queryKey: ["callerUploads"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCallerUploads();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useGetAllUploads() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<[Principal, UploadReference[]][]>({
    queryKey: ["allUploads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUploads();
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useUploadDocument() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blob,
      name,
      contentType,
      size,
    }: {
      blob: ExternalBlob;
      name: string;
      contentType: string;
      size: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadDocument(blob, name, contentType, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUploads"] });
      queryClient.invalidateQueries({ queryKey: ["allUploads"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

// Question Queries
export function useGetCallerQuestions() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<Question[]>({
    queryKey: ["callerQuestions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCallerQuestions();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useGetAllQuestions() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<[Principal, Question[]][]>({
    queryKey: ["allQuestions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useSubmitQuestion() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionText: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitQuestion(questionText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["allQuestions"] });
      toast.success("Question submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

export function useUpdateQuestionStatus() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      questionId,
      status,
    }: { user: Principal; questionId: string; status: QuestionStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateQuestionStatus(user, questionId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuestions"] });
      toast.success("Question status updated");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

export function useAnswerQuestion() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      questionId,
      reply,
    }: { user: Principal; questionId: string; reply: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.answerQuestion(user, questionId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allQuestions"] });
      toast.success("Reply sent successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

// Checklist Queries
export function useGetChecklistConfig() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<ChecklistConfig>({
    queryKey: ["checklistConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getChecklistConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCompletedChecklists() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<SavedChecklist[]>({
    queryKey: ["completedChecklists"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCompletedChecklists();
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

export function useGetChecklistByDate() {
  const { actor } = useLocalActor();

  return useMutation({
    mutationFn: async (date: bigint) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getChecklistByDate(date);
      } catch (error) {
        if (isAuthorizationError(error as Error)) {
          throw error;
        }
        throw error;
      }
    },
  });
}

export function useSaveChecklist() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverName,
      signature,
      checked,
    }: {
      driverName: string;
      signature: string;
      checked: [string, boolean][];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveChecklist(driverName, signature, checked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completedChecklists"] });
      queryClient.invalidateQueries({ queryKey: ["allChecklistSubmissions"] });
      toast.success("Checklist saved successfully");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}

export function useSaveChecklistAnonymous() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverName,
      signature,
      checked,
    }: {
      driverName: string;
      signature: string;
      checked: [string, boolean][];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveChecklist(driverName, signature, checked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allChecklistSubmissions"] });
    },
    onError: (error: Error) => {
      throw error;
    },
  });
}

// Admin: Get all checklist submissions
export function useGetAllChecklistSubmissions() {
  const { actor, isFetching: actorFetching, isActorReady } = useLocalActor();

  return useQuery<[Principal, ChecklistSubmission[]][]>({
    queryKey: ["allChecklistSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChecklistSubmissions();
    },
    enabled: !!actor && !actorFetching && isActorReady,
  });
}

// Legacy hook for backward compatibility
export function useGetAllSavedChecklists() {
  return useGetAllChecklistSubmissions();
}

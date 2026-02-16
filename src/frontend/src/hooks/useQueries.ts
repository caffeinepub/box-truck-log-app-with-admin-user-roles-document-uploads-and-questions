import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalActor } from './useLocalActor';
import type { UserProfile, LogEntry, UploadReference, Question, QuestionStatus, ChecklistConfig, SavedChecklist, PreTripChecklist } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// User Registration
export function useRegisterUser() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      toast.success('Registration successful');
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Authorization Queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Log Entry Queries
export function useGetCallerLogEntries() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<LogEntry[]>({
    queryKey: ['callerLogEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerLogEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllLogEntries() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<[Principal, LogEntry[]][]>({
    queryKey: ['allLogEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLogEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, notes, mileage }: { title: string | null; notes: string; mileage: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLogEntry(title, notes, mileage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerLogEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allLogEntries'] });
      toast.success('Log entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create log entry: ${error.message}`);
    },
  });
}

export function useUpdateLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, title, notes, mileage }: { logId: string; title: string | null; notes: string; mileage: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLogEntry(logId, title, notes, mileage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerLogEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allLogEntries'] });
      toast.success('Log entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update log entry: ${error.message}`);
    },
  });
}

export function useDeleteLogEntry() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLogEntry(logId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerLogEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allLogEntries'] });
      toast.success('Log entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete log entry: ${error.message}`);
    },
  });
}

// Document Upload Queries
export function useGetCallerUploads() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<UploadReference[]>({
    queryKey: ['callerUploads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerUploads();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllUploads() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<[Principal, UploadReference[]][]>({
    queryKey: ['allUploads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUploads();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadDocument() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blob, name, contentType, size }: { blob: ExternalBlob; name: string; contentType: string; size: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadDocument(blob, name, contentType, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUploads'] });
      queryClient.invalidateQueries({ queryKey: ['allUploads'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
}

// Question Queries
export function useGetCallerQuestions() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<Question[]>({
    queryKey: ['callerQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllQuestions() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<[Principal, Question[]][]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitQuestion() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionText: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitQuestion(questionText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
      toast.success('Question submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit question: ${error.message}`);
    },
  });
}

export function useUpdateQuestionStatus() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, questionId, status }: { user: Principal; questionId: string; status: QuestionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateQuestionStatus(user, questionId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
      toast.success('Question status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function useAnswerQuestion() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, questionId, reply }: { user: Principal; questionId: string; reply: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.answerQuestion(user, questionId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
      toast.success('Answer submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit answer: ${error.message}`);
    },
  });
}

// Checklist Queries
export function useGetChecklistConfig() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<ChecklistConfig>({
    queryKey: ['checklistConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getChecklistConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCompletedChecklists() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<SavedChecklist[]>({
    queryKey: ['completedChecklists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedChecklists();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllSavedChecklists() {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<[Principal, SavedChecklist[]][]>({
    queryKey: ['allSavedChecklists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSavedChecklists();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveChecklist() {
  const { actor } = useLocalActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: PreTripChecklist) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveChecklistFull(checklist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedChecklists'] });
      queryClient.invalidateQueries({ queryKey: ['allSavedChecklists'] });
      toast.success('Checklist saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save checklist: ${error.message}`);
    },
  });
}

// User Profile Lookup (for admin views)
export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useLocalActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

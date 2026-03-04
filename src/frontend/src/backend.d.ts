import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UploadReference {
    id: string;
    contentType: string;
    owner: Principal;
    blob: ExternalBlob;
    name: string;
    size: bigint;
    timestamp: Time;
}
export interface ChecklistSection {
    title: string;
    items: Array<ChecklistItem>;
}
export type Time = bigint;
export interface PreTripChecklist {
    driverId: Principal;
    checked: Array<[string, boolean]>;
    signature: string;
    timestamp: Time;
    driverName: string;
}
export interface ChecklistSubmission {
    checked: Array<[string, boolean]>;
    signature: string;
    userId: Principal;
    itemsCount: bigint;
    timestamp: Time;
    items: Array<ChecklistItem>;
    driverName: string;
}
export interface ChecklistConfig {
    sections: Array<ChecklistSection>;
}
export interface SavedChecklist {
    driverId: Principal;
    checked: Array<[string, boolean]>;
    signature: string;
    timestamp: Time;
    items: Array<ChecklistItem>;
    driverName: string;
}
export interface LogEntry {
    id: string;
    title?: string;
    mileage?: bigint;
    owner: Principal;
    notes: string;
    timestamp: Time;
}
export interface ChecklistItem {
    id: string;
    defaultChecked: boolean;
    name: string;
    prompt: string;
}
export interface Question {
    id: string;
    status: QuestionStatus;
    adminReply?: string;
    owner: Principal;
    questionText: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum QuestionStatus {
    open = "open",
    answered = "answered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    answerQuestion(user: Principal, questionId: string, reply: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCheckpointHistory(): Promise<void>;
    createLogEntry(title: string | null, notes: string, mileage: bigint | null): Promise<string>;
    deleteLogEntry(logId: string): Promise<void>;
    getAllChecklistSubmissions(): Promise<Array<[Principal, Array<ChecklistSubmission>]>>;
    getAllLogEntries(): Promise<Array<[Principal, Array<LogEntry>]>>;
    getAllQuestions(): Promise<Array<[Principal, Array<Question>]>>;
    getAllUploads(): Promise<Array<[Principal, Array<UploadReference>]>>;
    getCallerLogEntries(): Promise<Array<LogEntry>>;
    getCallerQuestions(): Promise<Array<Question>>;
    getCallerUploads(): Promise<Array<UploadReference>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChecklistByDate(date: Time): Promise<SavedChecklist | null>;
    getChecklistConfig(): Promise<ChecklistConfig>;
    getCompletedChecklists(): Promise<Array<SavedChecklist>>;
    getUserLogEntry(user: Principal, logId: string): Promise<LogEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuestion(user: Principal, questionId: string): Promise<Question>;
    getUserUpload(user: Principal, uploadId: string): Promise<UploadReference>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(displayName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveChecklist(driverName: string, signature: string, checked: Array<[string, boolean]>): Promise<void>;
    saveChecklistFull(checklist: PreTripChecklist): Promise<void>;
    submitQuestion(questionText: string): Promise<string>;
    updateLogEntry(logId: string, title: string | null, notes: string, mileage: bigint | null): Promise<void>;
    updateQuestionStatus(user: Principal, questionId: string, status: QuestionStatus): Promise<void>;
    updateUserProfile(displayName: string): Promise<void>;
    uploadDocument(blob: ExternalBlob, name: string, contentType: string, size: bigint): Promise<string>;
}

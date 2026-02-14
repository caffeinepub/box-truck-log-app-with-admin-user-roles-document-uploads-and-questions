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
export type Time = bigint;
export interface LogEntry {
    id: string;
    title?: string;
    mileage?: bigint;
    owner: Principal;
    notes: string;
    timestamp: Time;
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
    createLogEntry(title: string | null, notes: string, mileage: bigint | null): Promise<string>;
    deleteLogEntry(logId: string): Promise<void>;
    getAllLogEntries(): Promise<Array<[Principal, Array<LogEntry>]>>;
    getAllQuestions(): Promise<Array<[Principal, Array<Question>]>>;
    getAllUploads(): Promise<Array<[Principal, Array<UploadReference>]>>;
    getCallerLogEntries(): Promise<Array<LogEntry>>;
    getCallerQuestions(): Promise<Array<Question>>;
    getCallerUploads(): Promise<Array<UploadReference>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserLogEntry(user: Principal, logId: string): Promise<LogEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuestion(user: Principal, questionId: string): Promise<Question>;
    getUserUpload(user: Principal, uploadId: string): Promise<UploadReference>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuestion(questionText: string): Promise<string>;
    updateLogEntry(logId: string, title: string | null, notes: string, mileage: bigint | null): Promise<void>;
    updateQuestionStatus(user: Principal, questionId: string, status: QuestionStatus): Promise<void>;
    uploadDocument(blob: ExternalBlob, name: string, contentType: string, size: bigint): Promise<string>;
}

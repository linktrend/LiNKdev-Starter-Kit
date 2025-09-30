/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReminderResponse = {
    id?: string;
    org_id?: string;
    record_id?: string | null;
    title?: string;
    notes?: string | null;
    due_at?: string | null;
    status?: ReminderResponse.status;
    priority?: ReminderResponse.priority;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    snoozed_until?: string | null;
    completed_at?: string | null;
    sent_at?: string | null;
};
export namespace ReminderResponse {
    export enum status {
        PENDING = 'pending',
        SENT = 'sent',
        COMPLETED = 'completed',
        SNOOZED = 'snoozed',
        CANCELLED = 'cancelled',
    }
    export enum priority {
        LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        URGENT = 'urgent',
    }
}


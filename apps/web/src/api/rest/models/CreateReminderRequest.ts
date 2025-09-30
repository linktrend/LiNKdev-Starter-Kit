/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateReminderRequest = {
    /**
     * Organization ID
     */
    org_id: string;
    /**
     * Associated record ID (optional)
     */
    record_id?: string;
    /**
     * Reminder title
     */
    title: string;
    /**
     * Additional notes
     */
    notes?: string;
    /**
     * Due date and time
     */
    due_at?: string;
    /**
     * Reminder priority
     */
    priority?: CreateReminderRequest.priority;
};
export namespace CreateReminderRequest {
    /**
     * Reminder priority
     */
    export enum priority {
        LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        URGENT = 'urgent',
    }
}


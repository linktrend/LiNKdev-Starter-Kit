/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReminderResponse } from './ReminderResponse';
export type PaginatedRemindersResponse = {
    data?: Array<ReminderResponse>;
    /**
     * Cursor for next page
     */
    nextCursor?: string;
    /**
     * Total number of reminders
     */
    total?: number;
};


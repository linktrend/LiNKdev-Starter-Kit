/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReminderRequest } from '../models/CreateReminderRequest';
import type { PaginatedRemindersResponse } from '../models/PaginatedRemindersResponse';
import type { ReminderResponse } from '../models/ReminderResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SchedulingService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List reminders
     * Get reminders with optional filtering and pagination
     * @param recordId Filter by record ID
     * @param status Filter by status
     * @param priority Filter by priority
     * @param q Search query
     * @param limit Number of reminders to return (1-100)
     * @param cursor Cursor for pagination
     * @returns PaginatedRemindersResponse List of reminders
     * @throws ApiError
     */
    public getReminders(
        recordId?: string,
        status?: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled',
        priority?: 'low' | 'medium' | 'high' | 'urgent',
        q?: string,
        limit: number = 50,
        cursor?: string,
    ): CancelablePromise<PaginatedRemindersResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/reminders',
            query: {
                'record_id': recordId,
                'status': status,
                'priority': priority,
                'q': q,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Create reminder
     * Create a new reminder
     * @param requestBody
     * @returns ReminderResponse Reminder created successfully
     * @throws ApiError
     */
    public postReminders(
        requestBody: CreateReminderRequest,
    ): CancelablePromise<ReminderResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/reminders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Complete reminder
     * Mark a reminder as completed
     * @param id Reminder ID
     * @returns ReminderResponse Reminder completed successfully
     * @throws ApiError
     */
    public postRemindersComplete(
        id: string,
    ): CancelablePromise<ReminderResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/reminders/{id}/complete',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Resource not found`,
                429: `Rate limit exceeded`,
            },
        });
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedAuditResponse } from '../models/PaginatedAuditResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuditService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List audit logs
     * Get audit logs with optional filtering and pagination
     * @param q Search query
     * @param entityType Filter by entity type
     * @param action Filter by action
     * @param actorId Filter by actor ID
     * @param from Filter from date (ISO 8601)
     * @param to Filter to date (ISO 8601)
     * @param limit Number of logs to return (1-100)
     * @param cursor Cursor for pagination
     * @returns PaginatedAuditResponse List of audit logs
     * @throws ApiError
     */
    public getAudit(
        q?: string,
        entityType?: 'org' | 'record' | 'reminder' | 'subscription' | 'member' | 'invite' | 'schedule' | 'automation',
        action?: 'created' | 'updated' | 'deleted' | 'completed' | 'cancelled' | 'invited' | 'accepted' | 'rejected' | 'role_changed' | 'removed' | 'started' | 'stopped' | 'failed' | 'succeeded',
        actorId?: string,
        from?: string,
        to?: string,
        limit: number = 50,
        cursor?: string,
    ): CancelablePromise<PaginatedAuditResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/audit',
            query: {
                'q': q,
                'entity_type': entityType,
                'action': action,
                'actor_id': actorId,
                'from': from,
                'to': to,
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
}

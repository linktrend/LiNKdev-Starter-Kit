/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuditLogResponse } from './AuditLogResponse';
export type PaginatedAuditResponse = {
    data?: Array<AuditLogResponse>;
    /**
     * Cursor for next page
     */
    nextCursor?: string;
    /**
     * Total number of audit logs
     */
    total?: number;
};


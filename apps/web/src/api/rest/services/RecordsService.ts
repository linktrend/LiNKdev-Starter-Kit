/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRecordRequest } from '../models/CreateRecordRequest';
import type { PaginatedRecordsResponse } from '../models/PaginatedRecordsResponse';
import type { RecordResponse } from '../models/RecordResponse';
import type { UpdateRecordRequest } from '../models/UpdateRecordRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RecordsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List records
     * Get records with optional filtering and pagination
     * @param typeId Filter by record type ID
     * @param q Search query
     * @param limit Number of records to return (1-100)
     * @param cursor Cursor for pagination
     * @returns PaginatedRecordsResponse List of records
     * @throws ApiError
     */
    public getRecords(
        typeId?: string,
        q?: string,
        limit: number = 50,
        cursor?: string,
    ): CancelablePromise<PaginatedRecordsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/records',
            query: {
                'type_id': typeId,
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
     * Create record
     * Create a new record
     * @param requestBody
     * @returns RecordResponse Record created successfully
     * @throws ApiError
     */
    public postRecords(
        requestBody: CreateRecordRequest,
    ): CancelablePromise<RecordResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/records',
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
     * Get record
     * Get a single record by ID
     * @param id Record ID
     * @returns RecordResponse Record details
     * @throws ApiError
     */
    public getRecords1(
        id: string,
    ): CancelablePromise<RecordResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/records/{id}',
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
    /**
     * Update record
     * Update a record
     * @param id Record ID
     * @param requestBody
     * @returns RecordResponse Record updated successfully
     * @throws ApiError
     */
    public patchRecords(
        id: string,
        requestBody: UpdateRecordRequest,
    ): CancelablePromise<RecordResponse> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/records/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                404: `Resource not found`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Delete record
     * Delete a record
     * @param id Record ID
     * @returns any Record deleted successfully
     * @throws ApiError
     */
    public deleteRecords(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
    }> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/records/{id}',
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

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecordResponse } from './RecordResponse';
export type PaginatedRecordsResponse = {
    data?: Array<RecordResponse>;
    /**
     * Cursor for next page
     */
    nextCursor?: string;
    /**
     * Total number of records
     */
    total?: number;
};


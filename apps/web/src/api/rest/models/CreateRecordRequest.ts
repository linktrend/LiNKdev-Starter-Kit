/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateRecordRequest = {
    /**
     * Record type ID
     */
    type_id: string;
    /**
     * Organization ID (optional, defaults to authenticated user's org)
     */
    org_id?: string;
    /**
     * User ID (optional)
     */
    user_id?: string;
    /**
     * Record data
     */
    data: Record<string, any>;
};


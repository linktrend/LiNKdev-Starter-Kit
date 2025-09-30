/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuditLogResponse = {
    id?: string;
    org_id?: string;
    actor_id?: string | null;
    /**
     * Action performed
     */
    action?: string;
    /**
     * Type of entity affected
     */
    entity_type?: string;
    /**
     * ID of entity affected
     */
    entity_id?: string;
    /**
     * Additional metadata
     */
    metadata?: Record<string, any>;
    created_at?: string;
};


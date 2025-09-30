/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCheckoutRequest = {
    /**
     * Organization ID
     */
    org_id: string;
    /**
     * Plan identifier
     */
    plan: string;
    /**
     * Success redirect URL
     */
    success_url: string;
    /**
     * Cancel redirect URL
     */
    cancel_url: string;
};


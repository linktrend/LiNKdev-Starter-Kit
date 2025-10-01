/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export type SubscriptionResponse = {
    org_id?: string;
    /**
     * Subscription plan
     */
    plan?: string;
    status?: SubscriptionResponse.status;
    current_period_start?: string;
    current_period_end?: string;
    trial_end?: string | null;
    stripe_sub_id?: string | null;
    updated_at?: string;
};
export namespace SubscriptionResponse {
    export enum status {
        ACTIVE = 'active',
        TRIALING = 'trialing',
        CANCELED = 'canceled',
        INCOMPLETE = 'incomplete',
        INCOMPLETE_EXPIRED = 'incomplete_expired',
        PAST_DUE = 'past_due',
        UNPAID = 'unpaid',
        PAUSED = 'paused',
    }
}


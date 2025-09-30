/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckoutResponse } from '../models/CheckoutResponse';
import type { CreateCheckoutRequest } from '../models/CreateCheckoutRequest';
import type { SubscriptionResponse } from '../models/SubscriptionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BillingService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get subscription
     * Get organization subscription details
     * @returns SubscriptionResponse Subscription details
     * @throws ApiError
     */
    public getBillingSubscription(): CancelablePromise<SubscriptionResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/billing/subscription',
            errors: {
                401: `Unauthorized`,
                404: `Resource not found`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Create checkout session
     * Create a Stripe checkout session for subscription
     * @param requestBody
     * @returns CheckoutResponse Checkout session created successfully
     * @throws ApiError
     */
    public postBillingCheckout(
        requestBody: CreateCheckoutRequest,
    ): CancelablePromise<CheckoutResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/billing/checkout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                429: `Rate limit exceeded`,
            },
        });
    }
}

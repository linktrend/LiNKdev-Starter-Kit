/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrgRequest } from '../models/CreateOrgRequest';
import type { OrgResponse } from '../models/OrgResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrganizationsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List organizations
     * Get all organizations the authenticated user is a member of
     * @returns OrgResponse List of organizations
     * @throws ApiError
     */
    public getOrgs(): CancelablePromise<Array<OrgResponse>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/orgs',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Create organization
     * Create a new organization
     * @param requestBody
     * @returns OrgResponse Organization created successfully
     * @throws ApiError
     */
    public postOrgs(
        requestBody: CreateOrgRequest,
    ): CancelablePromise<OrgResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/orgs',
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

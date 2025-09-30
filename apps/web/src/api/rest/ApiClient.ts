/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { AuditService } from './services/AuditService';
import { BillingService } from './services/BillingService';
import { OrganizationsService } from './services/OrganizationsService';
import { RecordsService } from './services/RecordsService';
import { SchedulingService } from './services/SchedulingService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
    public readonly audit: AuditService;
    public readonly billing: BillingService;
    public readonly organizations: OrganizationsService;
    public readonly records: RecordsService;
    public readonly scheduling: SchedulingService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://api.ltm-starter-kit.dev/v1',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.audit = new AuditService(this.request);
        this.billing = new BillingService(this.request);
        this.organizations = new OrganizationsService(this.request);
        this.records = new RecordsService(this.request);
        this.scheduling = new SchedulingService(this.request);
    }
}


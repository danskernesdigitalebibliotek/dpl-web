import { Client as SoapClient, createClientAsync as soapCreateClientAsync, type IExOptions as ISoapExOptions } from "soap";
import type { GetProductLoanStatus } from "./definitions/GetProductLoanStatus";
import type { GetProductLoanStatusResponse } from "./definitions/GetProductLoanStatusResponse";
import type { GetProductLoanStatusList } from "./definitions/GetProductLoanStatusList";
import type { GetProductLoanStatusListResponse } from "./definitions/GetProductLoanStatusListResponse";
import type { Getproductloanstatus } from "./services/Getproductloanstatus";

export interface GetproductloanstatusClient extends SoapClient {
    Getproductloanstatus: Getproductloanstatus;
    GetProductLoanStatusAsync(getProductLoanStatus: GetProductLoanStatus, options?: ISoapExOptions): Promise<[result: GetProductLoanStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetProductLoanStatusListAsync(getProductLoanStatusList: GetProductLoanStatusList, options?: ISoapExOptions): Promise<[result: GetProductLoanStatusListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetProductLoanStatusAsync(getProductLoanStatus: GetProductLoanStatus, options?: ISoapExOptions): Promise<[result: GetProductLoanStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetProductLoanStatusListAsync(getProductLoanStatusList: GetProductLoanStatusList, options?: ISoapExOptions): Promise<[result: GetProductLoanStatusListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetproductloanstatusClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetproductloanstatusClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { GetProductLoanStatus } from "./definitions/GetProductLoanStatus";
import { GetProductLoanStatusResponse } from "./definitions/GetProductLoanStatusResponse";
import { GetProductLoanStatusList } from "./definitions/GetProductLoanStatusList";
import { GetProductLoanStatusListResponse } from "./definitions/GetProductLoanStatusListResponse";
import { Getproductloanstatus } from "./services/Getproductloanstatus";

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

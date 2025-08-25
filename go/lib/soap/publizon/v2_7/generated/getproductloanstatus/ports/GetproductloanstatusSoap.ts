import type { GetProductLoanStatus } from "../definitions/GetProductLoanStatus";
import type { GetProductLoanStatusResponse } from "../definitions/GetProductLoanStatusResponse";
import type { GetProductLoanStatusList } from "../definitions/GetProductLoanStatusList";
import type { GetProductLoanStatusListResponse } from "../definitions/GetProductLoanStatusListResponse";

export interface GetproductloanstatusSoap {
    GetProductLoanStatus(getProductLoanStatus: GetProductLoanStatus, callback: (err: any, result: GetProductLoanStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetProductLoanStatusList(getProductLoanStatusList: GetProductLoanStatusList, callback: (err: any, result: GetProductLoanStatusListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

import { GetProductLoanStatus } from "../definitions/GetProductLoanStatus";
import { GetProductLoanStatusResponse } from "../definitions/GetProductLoanStatusResponse";
import { GetProductLoanStatusList } from "../definitions/GetProductLoanStatusList";
import { GetProductLoanStatusListResponse } from "../definitions/GetProductLoanStatusListResponse";

export interface GetproductloanstatusSoap {
    GetProductLoanStatus(getProductLoanStatus: GetProductLoanStatus, callback: (err: any, result: GetProductLoanStatusResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetProductLoanStatusList(getProductLoanStatusList: GetProductLoanStatusList, callback: (err: any, result: GetProductLoanStatusListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

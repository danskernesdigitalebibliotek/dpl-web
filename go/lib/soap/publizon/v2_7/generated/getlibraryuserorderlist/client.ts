import { Client as SoapClient, createClientAsync as soapCreateClientAsync, type IExOptions as ISoapExOptions } from "soap";
import type { GetLibraryUserOrderList } from "./definitions/GetLibraryUserOrderList";
import type { GetLibraryUserOrderListResponse } from "./definitions/GetLibraryUserOrderListResponse";
import type { GetLibraryUserOrder } from "./definitions/GetLibraryUserOrder";
import type { GetLibraryUserOrderResponse } from "./definitions/GetLibraryUserOrderResponse";
import type { Getlibraryuserorderlist } from "./services/Getlibraryuserorderlist";

export interface GetlibraryuserorderlistClient extends SoapClient {
    Getlibraryuserorderlist: Getlibraryuserorderlist;
    GetLibraryUserOrderListAsync(getLibraryUserOrderList: GetLibraryUserOrderList, options?: ISoapExOptions): Promise<[result: GetLibraryUserOrderListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetLibraryUserOrderAsync(getLibraryUserOrder: GetLibraryUserOrder, options?: ISoapExOptions): Promise<[result: GetLibraryUserOrderResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetLibraryUserOrderListAsync(getLibraryUserOrderList: GetLibraryUserOrderList, options?: ISoapExOptions): Promise<[result: GetLibraryUserOrderListResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetLibraryUserOrderAsync(getLibraryUserOrder: GetLibraryUserOrder, options?: ISoapExOptions): Promise<[result: GetLibraryUserOrderResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetlibraryuserorderlistClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetlibraryuserorderlistClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

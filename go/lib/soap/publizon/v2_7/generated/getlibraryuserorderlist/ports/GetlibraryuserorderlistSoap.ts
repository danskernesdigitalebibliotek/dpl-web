import type { GetLibraryUserOrderList } from "../definitions/GetLibraryUserOrderList";
import type { GetLibraryUserOrderListResponse } from "../definitions/GetLibraryUserOrderListResponse";
import type { GetLibraryUserOrder } from "../definitions/GetLibraryUserOrder";
import type { GetLibraryUserOrderResponse } from "../definitions/GetLibraryUserOrderResponse";

export interface GetlibraryuserorderlistSoap {
    GetLibraryUserOrderList(getLibraryUserOrderList: GetLibraryUserOrderList, callback: (err: any, result: GetLibraryUserOrderListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetLibraryUserOrder(getLibraryUserOrder: GetLibraryUserOrder, callback: (err: any, result: GetLibraryUserOrderResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

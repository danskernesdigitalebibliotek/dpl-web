import { GetLibraryUserOrderList } from "../definitions/GetLibraryUserOrderList";
import { GetLibraryUserOrderListResponse } from "../definitions/GetLibraryUserOrderListResponse";
import { GetLibraryUserOrder } from "../definitions/GetLibraryUserOrder";
import { GetLibraryUserOrderResponse } from "../definitions/GetLibraryUserOrderResponse";

export interface GetlibraryuserorderlistSoap12 {
    GetLibraryUserOrderList(getLibraryUserOrderList: GetLibraryUserOrderList, callback: (err: any, result: GetLibraryUserOrderListResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    GetLibraryUserOrder(getLibraryUserOrder: GetLibraryUserOrder, callback: (err: any, result: GetLibraryUserOrderResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

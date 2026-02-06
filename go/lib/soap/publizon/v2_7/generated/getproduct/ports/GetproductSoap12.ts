import type { GetProduct } from "../definitions/GetProduct";
import type { GetProductResponse } from "../definitions/GetProductResponse";

export interface GetproductSoap12 {
    GetProduct(getProduct: GetProduct, callback: (err: any, result: GetProductResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

import { GetProduct } from "../definitions/GetProduct";
import { GetProductResponse } from "../definitions/GetProductResponse";

export interface GetproductSoap {
    GetProduct(getProduct: GetProduct, callback: (err: any, result: GetProductResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

import { Client as SoapClient, createClientAsync as soapCreateClientAsync, type IExOptions as ISoapExOptions } from "soap";
import type { GetProduct } from "./definitions/GetProduct";
import type { GetProductResponse } from "./definitions/GetProductResponse";
import type { Getproduct } from "./services/Getproduct";

export interface GetproductClient extends SoapClient {
    Getproduct: Getproduct;
    GetProductAsync(getProduct: GetProduct, options?: ISoapExOptions): Promise<[result: GetProductResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetProductAsync(getProduct: GetProduct, options?: ISoapExOptions): Promise<[result: GetProductResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetproductClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetproductClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

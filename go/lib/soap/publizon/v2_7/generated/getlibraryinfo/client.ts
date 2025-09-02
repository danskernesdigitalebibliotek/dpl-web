import { Client as SoapClient, createClientAsync as soapCreateClientAsync, type IExOptions as ISoapExOptions } from "soap";
import type { GetLibraryProfile } from "./definitions/GetLibraryProfile";
import type { GetLibraryProfileResponse } from "./definitions/GetLibraryProfileResponse";
import type { Getlibraryinfo } from "./services/Getlibraryinfo";

export interface GetlibraryinfoClient extends SoapClient {
    Getlibraryinfo: Getlibraryinfo;
    GetLibraryProfileAsync(getLibraryProfile: GetLibraryProfile, options?: ISoapExOptions): Promise<[result: GetLibraryProfileResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetLibraryProfileAsync(getLibraryProfile: GetLibraryProfile, options?: ISoapExOptions): Promise<[result: GetLibraryProfileResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetlibraryinfoClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetlibraryinfoClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

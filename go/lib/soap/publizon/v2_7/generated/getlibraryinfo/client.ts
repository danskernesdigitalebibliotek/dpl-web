import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { GetLibraryProfile } from "./definitions/GetLibraryProfile";
import { GetLibraryProfileResponse } from "./definitions/GetLibraryProfileResponse";
import { Getlibraryinfo } from "./services/Getlibraryinfo";

export interface GetlibraryinfoClient extends SoapClient {
    Getlibraryinfo: Getlibraryinfo;
    GetLibraryProfileAsync(getLibraryProfile: GetLibraryProfile, options?: ISoapExOptions): Promise<[result: GetLibraryProfileResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetLibraryProfileAsync(getLibraryProfile: GetLibraryProfile, options?: ISoapExOptions): Promise<[result: GetLibraryProfileResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetlibraryinfoClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetlibraryinfoClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

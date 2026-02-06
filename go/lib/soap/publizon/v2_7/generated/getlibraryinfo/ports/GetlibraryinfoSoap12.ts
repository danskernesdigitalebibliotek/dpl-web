import type { GetLibraryProfile } from "../definitions/GetLibraryProfile";
import type { GetLibraryProfileResponse } from "../definitions/GetLibraryProfileResponse";

export interface GetlibraryinfoSoap12 {
    GetLibraryProfile(getLibraryProfile: GetLibraryProfile, callback: (err: any, result: GetLibraryProfileResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

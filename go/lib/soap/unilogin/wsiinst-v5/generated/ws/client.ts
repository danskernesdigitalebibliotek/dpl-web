import { Client as SoapClient, createClientAsync as soapCreateClientAsync, type IExOptions as ISoapExOptions } from "soap";
import type { TnsnoArgs } from "./definitions/TnsnoArgs";
import type { TnshelloWorldResponse } from "./definitions/TnshelloWorldResponse";
import type { Tnscredentials } from "./definitions/Tnscredentials";
import type { TnshelloWorldResponse1 } from "./definitions/TnshelloWorldResponse1";
import type { TnsnoArgs1 } from "./definitions/TnsnoArgs1";
import type { TnshelloWorldResponse2 } from "./definitions/TnshelloWorldResponse2";
import type { TnshentGrupper } from "./definitions/TnshentGrupper";
import type { TnshentGrupperResponse } from "./definitions/TnshentGrupperResponse";
import type { TnshentBrugereIgruppe } from "./definitions/TnshentBrugereIgruppe";
import type { TnshentBrugereIgruppeResponse } from "./definitions/TnshentBrugereIgruppeResponse";
import type { TnshentGruppersLicenser } from "./definitions/TnshentGruppersLicenser";
import type { TnshentGruppersLicenserResponse } from "./definitions/TnshentGruppersLicenserResponse";
import type { TnshentInstitution } from "./definitions/TnshentInstitution";
import type { TnshentInstitutionResponse } from "./definitions/TnshentInstitutionResponse";
import type { TnshentInstitutioner } from "./definitions/TnshentInstitutioner";
import type { TnshentInstitutionerResponse } from "./definitions/TnshentInstitutionerResponse";
import type { TnshentInstBruger } from "./definitions/TnshentInstBruger";
import type { TnshentInstBrugerResponse } from "./definitions/TnshentInstBrugerResponse";
import type { Tnscredentials1 } from "./definitions/Tnscredentials1";
import type { TnshentDataAftalerResponse } from "./definitions/TnshentDataAftalerResponse";
import type { WsiInst } from "./services/WsiInst";

export interface WsClient extends SoapClient {
    WsiInst: WsiInst;
    helloWorldAsync(helloWorld: TnsnoArgs, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    helloWorldWithDBAndCredentialsAsync(helloWorldWithDbAndCredentials: Tnscredentials, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse1, rawResponse: any, soapHeader: any, rawRequest: any]>;
    helloWorldWithDBAsync(helloWorldWithDb: TnsnoArgs1, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse2, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentGrupperAsync(hentGrupper: TnshentGrupper, options?: ISoapExOptions): Promise<[result: TnshentGrupperResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentBrugereIGruppeAsync(hentBrugereIgruppe: TnshentBrugereIgruppe, options?: ISoapExOptions): Promise<[result: TnshentBrugereIgruppeResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentGruppersLicenserAsync(hentGruppersLicenser: TnshentGruppersLicenser, options?: ISoapExOptions): Promise<[result: TnshentGruppersLicenserResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentInstitutionAsync(hentInstitution: TnshentInstitution, options?: ISoapExOptions): Promise<[result: TnshentInstitutionResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentInstitutionerAsync(hentInstitutioner: TnshentInstitutioner, options?: ISoapExOptions): Promise<[result: TnshentInstitutionerResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentInstBrugerAsync(hentInstBruger: TnshentInstBruger, options?: ISoapExOptions): Promise<[result: TnshentInstBrugerResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentDataAftalerAsync(hentDataAftaler: Tnscredentials1, options?: ISoapExOptions): Promise<[result: TnshentDataAftalerResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create WsClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<WsClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

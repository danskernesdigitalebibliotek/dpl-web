import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { TnsnoArgs } from "./definitions/TnsnoArgs";
import { TnshelloWorldResponse } from "./definitions/TnshelloWorldResponse";
import { Tnscredentials } from "./definitions/Tnscredentials";
import { TnshelloWorldResponse1 } from "./definitions/TnshelloWorldResponse1";
import { TnsnoArgs1 } from "./definitions/TnsnoArgs1";
import { TnshelloWorldResponse2 } from "./definitions/TnshelloWorldResponse2";
import { TnshentGrupper } from "./definitions/TnshentGrupper";
import { TnshentGrupperResponse } from "./definitions/TnshentGrupperResponse";
import { TnshentBrugereIGruppe } from "./definitions/TnshentBrugereIGruppe";
import { TnshentBrugereIGruppeResponse } from "./definitions/TnshentBrugereIGruppeResponse";
import { TnshentGruppersLicenser } from "./definitions/TnshentGruppersLicenser";
import { TnshentGruppersLicenserResponse } from "./definitions/TnshentGruppersLicenserResponse";
import { TnshentInstitution } from "./definitions/TnshentInstitution";
import { TnshentInstitutionResponse } from "./definitions/TnshentInstitutionResponse";
import { TnshentInstitutioner } from "./definitions/TnshentInstitutioner";
import { TnshentInstitutionerResponse } from "./definitions/TnshentInstitutionerResponse";
import { TnshentInstBruger } from "./definitions/TnshentInstBruger";
import { TnshentInstBrugerResponse } from "./definitions/TnshentInstBrugerResponse";
import { Tnscredentials1 } from "./definitions/Tnscredentials1";
import { TnshentDataAftalerResponse } from "./definitions/TnshentDataAftalerResponse";
import { WsiInst } from "./services/WsiInst";

export interface WsClient extends SoapClient {
    WsiInst: WsiInst;
    helloWorldAsync(helloWorld: TnsnoArgs, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    helloWorldWithDBAndCredentialsAsync(helloWorldWithDbAndCredentials: Tnscredentials, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse1, rawResponse: any, soapHeader: any, rawRequest: any]>;
    helloWorldWithDBAsync(helloWorldWithDb: TnsnoArgs1, options?: ISoapExOptions): Promise<[result: TnshelloWorldResponse2, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentGrupperAsync(hentGrupper: TnshentGrupper, options?: ISoapExOptions): Promise<[result: TnshentGrupperResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    hentBrugereIGruppeAsync(hentBrugereIGruppe: TnshentBrugereIGruppe, options?: ISoapExOptions): Promise<[result: TnshentBrugereIGruppeResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
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

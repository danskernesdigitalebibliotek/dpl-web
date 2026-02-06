import type { TnsnoArgs } from "../definitions/TnsnoArgs";
import type { TnshelloWorldResponse } from "../definitions/TnshelloWorldResponse";
import type { Tnscredentials } from "../definitions/Tnscredentials";
import type { TnshelloWorldResponse1 } from "../definitions/TnshelloWorldResponse1";
import type { TnsnoArgs1 } from "../definitions/TnsnoArgs1";
import type { TnshelloWorldResponse2 } from "../definitions/TnshelloWorldResponse2";
import type { TnshentGrupper } from "../definitions/TnshentGrupper";
import type { TnshentGrupperResponse } from "../definitions/TnshentGrupperResponse";
import type { TnshentBrugereIgruppe } from "../definitions/TnshentBrugereIgruppe";
import type { TnshentBrugereIgruppeResponse } from "../definitions/TnshentBrugereIgruppeResponse";
import type { TnshentGruppersLicenser } from "../definitions/TnshentGruppersLicenser";
import type { TnshentGruppersLicenserResponse } from "../definitions/TnshentGruppersLicenserResponse";
import type { TnshentInstitution } from "../definitions/TnshentInstitution";
import type { TnshentInstitutionResponse } from "../definitions/TnshentInstitutionResponse";
import type { TnshentInstitutioner } from "../definitions/TnshentInstitutioner";
import type { TnshentInstitutionerResponse } from "../definitions/TnshentInstitutionerResponse";
import type { TnshentInstBruger } from "../definitions/TnshentInstBruger";
import type { TnshentInstBrugerResponse } from "../definitions/TnshentInstBrugerResponse";
import type { Tnscredentials1 } from "../definitions/Tnscredentials1";
import type { TnshentDataAftalerResponse } from "../definitions/TnshentDataAftalerResponse";

export interface WsiInstPort {
    helloWorld(helloWorld: TnsnoArgs, callback: (err: any, result: TnshelloWorldResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    helloWorldWithDBAndCredentials(helloWorldWithDbAndCredentials: Tnscredentials, callback: (err: any, result: TnshelloWorldResponse1, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    helloWorldWithDB(helloWorldWithDb: TnsnoArgs1, callback: (err: any, result: TnshelloWorldResponse2, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentGrupper(hentGrupper: TnshentGrupper, callback: (err: any, result: TnshentGrupperResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentBrugereIGruppe(hentBrugereIgruppe: TnshentBrugereIgruppe, callback: (err: any, result: TnshentBrugereIgruppeResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentGruppersLicenser(hentGruppersLicenser: TnshentGruppersLicenser, callback: (err: any, result: TnshentGruppersLicenserResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitution(hentInstitution: TnshentInstitution, callback: (err: any, result: TnshentInstitutionResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitutioner(hentInstitutioner: TnshentInstitutioner, callback: (err: any, result: TnshentInstitutionerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstBruger(hentInstBruger: TnshentInstBruger, callback: (err: any, result: TnshentInstBrugerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentDataAftaler(hentDataAftaler: Tnscredentials1, callback: (err: any, result: TnshentDataAftalerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

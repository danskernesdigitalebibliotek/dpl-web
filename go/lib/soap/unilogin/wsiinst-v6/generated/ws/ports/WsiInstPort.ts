import type { TnsnoArgs } from "../definitions/TnsnoArgs";
import type { TnshelloWorldResponse } from "../definitions/TnshelloWorldResponse";
import type { TnshentGrupper } from "../definitions/TnshentGrupper";
import type { TnshentGrupperResponse } from "../definitions/TnshentGrupperResponse";
import type { TnshentBrugereIgruppe } from "../definitions/TnshentBrugereIgruppe";
import type { TnshentBrugereIgruppeResponse } from "../definitions/TnshentBrugereIgruppeResponse";
import type { TnshentInstitution } from "../definitions/TnshentInstitution";
import type { TnshentInstitutionResponse } from "../definitions/TnshentInstitutionResponse";
import type { TnshentInstitutioner } from "../definitions/TnshentInstitutioner";
import type { TnshentInstitutionerResponse } from "../definitions/TnshentInstitutionerResponse";
import type { TnshentInstBruger } from "../definitions/TnshentInstBruger";
import type { TnshentInstBrugerResponse } from "../definitions/TnshentInstBrugerResponse";
import type { TnsnoArgs1 } from "../definitions/TnsnoArgs1";
import type { TnshentDataAftalerResponse } from "../definitions/TnshentDataAftalerResponse";
import type { TnshentInstitutionshierarki } from "../definitions/TnshentInstitutionshierarki";
import type { TnshentInstitutionshierarkiResponse } from "../definitions/TnshentInstitutionshierarkiResponse";

export interface WsiInstPort {
    helloWorldWithCertificate(helloWorldWithCertificate: TnsnoArgs, callback: (err: any, result: TnshelloWorldResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentGrupper(hentGrupper: TnshentGrupper, callback: (err: any, result: TnshentGrupperResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentBrugereIGruppe(hentBrugereIgruppe: TnshentBrugereIgruppe, callback: (err: any, result: TnshentBrugereIgruppeResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitution(hentInstitution: TnshentInstitution, callback: (err: any, result: TnshentInstitutionResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitutioner(hentInstitutioner: TnshentInstitutioner, callback: (err: any, result: TnshentInstitutionerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstBruger(hentInstBruger: TnshentInstBruger, callback: (err: any, result: TnshentInstBrugerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentDataAftaler(hentDataAftaler: TnsnoArgs1, callback: (err: any, result: TnshentDataAftalerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitutionshierarki(hentInstitutionshierarki: TnshentInstitutionshierarki, callback: (err: any, result: TnshentInstitutionshierarkiResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

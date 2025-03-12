import { TnsnoArgs } from "../definitions/TnsnoArgs";
import { TnshelloWorldResponse } from "../definitions/TnshelloWorldResponse";
import { Tnscredentials } from "../definitions/Tnscredentials";
import { TnshelloWorldResponse1 } from "../definitions/TnshelloWorldResponse1";
import { TnsnoArgs1 } from "../definitions/TnsnoArgs1";
import { TnshelloWorldResponse2 } from "../definitions/TnshelloWorldResponse2";
import { TnshentGrupper } from "../definitions/TnshentGrupper";
import { TnshentGrupperResponse } from "../definitions/TnshentGrupperResponse";
import { TnshentBrugereIGruppe } from "../definitions/TnshentBrugereIGruppe";
import { TnshentBrugereIGruppeResponse } from "../definitions/TnshentBrugereIGruppeResponse";
import { TnshentGruppersLicenser } from "../definitions/TnshentGruppersLicenser";
import { TnshentGruppersLicenserResponse } from "../definitions/TnshentGruppersLicenserResponse";
import { TnshentInstitution } from "../definitions/TnshentInstitution";
import { TnshentInstitutionResponse } from "../definitions/TnshentInstitutionResponse";
import { TnshentInstitutioner } from "../definitions/TnshentInstitutioner";
import { TnshentInstitutionerResponse } from "../definitions/TnshentInstitutionerResponse";
import { TnshentInstBruger } from "../definitions/TnshentInstBruger";
import { TnshentInstBrugerResponse } from "../definitions/TnshentInstBrugerResponse";
import { Tnscredentials1 } from "../definitions/Tnscredentials1";
import { TnshentDataAftalerResponse } from "../definitions/TnshentDataAftalerResponse";

export interface WsiInstPort {
    helloWorld(helloWorld: TnsnoArgs, callback: (err: any, result: TnshelloWorldResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    helloWorldWithDBAndCredentials(helloWorldWithDbAndCredentials: Tnscredentials, callback: (err: any, result: TnshelloWorldResponse1, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    helloWorldWithDB(helloWorldWithDb: TnsnoArgs1, callback: (err: any, result: TnshelloWorldResponse2, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentGrupper(hentGrupper: TnshentGrupper, callback: (err: any, result: TnshentGrupperResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentBrugereIGruppe(hentBrugereIGruppe: TnshentBrugereIGruppe, callback: (err: any, result: TnshentBrugereIGruppeResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentGruppersLicenser(hentGruppersLicenser: TnshentGruppersLicenser, callback: (err: any, result: TnshentGruppersLicenserResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitution(hentInstitution: TnshentInstitution, callback: (err: any, result: TnshentInstitutionResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstitutioner(hentInstitutioner: TnshentInstitutioner, callback: (err: any, result: TnshentInstitutionerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentInstBruger(hentInstBruger: TnshentInstBruger, callback: (err: any, result: TnshentInstBrugerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
    hentDataAftaler(hentDataAftaler: Tnscredentials1, callback: (err: any, result: TnshentDataAftalerResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

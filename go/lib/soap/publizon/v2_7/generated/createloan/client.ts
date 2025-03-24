import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { CreateLoan } from "./definitions/CreateLoan";
import { CreateLoanResponse } from "./definitions/CreateLoanResponse";
import { Createloan } from "./services/Createloan";

export interface CreateloanClient extends SoapClient {
    Createloan: Createloan;
    CreateLoanAsync(createLoan: CreateLoan, options?: ISoapExOptions): Promise<[result: CreateLoanResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    CreateLoanAsync(createLoan: CreateLoan, options?: ISoapExOptions): Promise<[result: CreateLoanResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create CreateloanClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<CreateloanClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

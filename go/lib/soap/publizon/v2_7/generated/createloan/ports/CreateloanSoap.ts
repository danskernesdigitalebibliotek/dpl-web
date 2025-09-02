import type { CreateLoan } from "../definitions/CreateLoan";
import type { CreateLoanResponse } from "../definitions/CreateLoanResponse";

export interface CreateloanSoap {
    CreateLoan(createLoan: CreateLoan, callback: (err: any, result: CreateLoanResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

import { CreateLoan } from "../definitions/CreateLoan";
import { CreateLoanResponse } from "../definitions/CreateLoanResponse";

export interface CreateloanSoap12 {
    CreateLoan(createLoan: CreateLoan, callback: (err: any, result: CreateLoanResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

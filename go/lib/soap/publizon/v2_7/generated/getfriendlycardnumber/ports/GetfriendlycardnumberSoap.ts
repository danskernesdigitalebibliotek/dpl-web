import type { GetFriendlyCardnumber } from "../definitions/GetFriendlyCardnumber";
import type { GetFriendlyCardnumberResponse } from "../definitions/GetFriendlyCardnumberResponse";

export interface GetfriendlycardnumberSoap {
    GetFriendlyCardnumber(getFriendlyCardnumber: GetFriendlyCardnumber, callback: (err: any, result: GetFriendlyCardnumberResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}

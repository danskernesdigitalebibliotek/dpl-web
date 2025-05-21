import { Client as SoapClient, createClientAsync as soapCreateClientAsync, IExOptions as ISoapExOptions } from "soap";
import { GetFriendlyCardnumber } from "./definitions/GetFriendlyCardnumber";
import { GetFriendlyCardnumberResponse } from "./definitions/GetFriendlyCardnumberResponse";
import { Getfriendlycardnumber } from "./services/Getfriendlycardnumber";

export interface GetfriendlycardnumberClient extends SoapClient {
    Getfriendlycardnumber: Getfriendlycardnumber;
    GetFriendlyCardnumberAsync(getFriendlyCardnumber: GetFriendlyCardnumber, options?: ISoapExOptions): Promise<[result: GetFriendlyCardnumberResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
    GetFriendlyCardnumberAsync(getFriendlyCardnumber: GetFriendlyCardnumber, options?: ISoapExOptions): Promise<[result: GetFriendlyCardnumberResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create GetfriendlycardnumberClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<GetfriendlycardnumberClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}

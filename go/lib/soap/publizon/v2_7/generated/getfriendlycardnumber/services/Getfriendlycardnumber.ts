import type { GetfriendlycardnumberSoap } from "../ports/GetfriendlycardnumberSoap";
import type { GetfriendlycardnumberSoap12 } from "../ports/GetfriendlycardnumberSoap12";

export interface Getfriendlycardnumber {
    readonly GetfriendlycardnumberSoap: GetfriendlycardnumberSoap;
    readonly GetfriendlycardnumberSoap12: GetfriendlycardnumberSoap12;
}

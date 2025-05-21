import { GetfriendlycardnumberSoap } from "../ports/GetfriendlycardnumberSoap";
import { GetfriendlycardnumberSoap12 } from "../ports/GetfriendlycardnumberSoap12";

export interface Getfriendlycardnumber {
    readonly GetfriendlycardnumberSoap: GetfriendlycardnumberSoap;
    readonly GetfriendlycardnumberSoap12: GetfriendlycardnumberSoap12;
}

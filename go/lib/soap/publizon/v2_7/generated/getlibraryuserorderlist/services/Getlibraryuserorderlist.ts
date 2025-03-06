import { GetlibraryuserorderlistSoap } from "../ports/GetlibraryuserorderlistSoap";
import { GetlibraryuserorderlistSoap12 } from "../ports/GetlibraryuserorderlistSoap12";

export interface Getlibraryuserorderlist {
    readonly GetlibraryuserorderlistSoap: GetlibraryuserorderlistSoap;
    readonly GetlibraryuserorderlistSoap12: GetlibraryuserorderlistSoap12;
}

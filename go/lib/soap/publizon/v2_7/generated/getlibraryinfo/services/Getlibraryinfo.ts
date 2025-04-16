import { GetlibraryinfoSoap } from "../ports/GetlibraryinfoSoap";
import { GetlibraryinfoSoap12 } from "../ports/GetlibraryinfoSoap12";

export interface Getlibraryinfo {
    readonly GetlibraryinfoSoap: GetlibraryinfoSoap;
    readonly GetlibraryinfoSoap12: GetlibraryinfoSoap12;
}

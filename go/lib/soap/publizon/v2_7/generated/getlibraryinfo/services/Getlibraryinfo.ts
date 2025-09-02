import type { GetlibraryinfoSoap } from "../ports/GetlibraryinfoSoap";
import type { GetlibraryinfoSoap12 } from "../ports/GetlibraryinfoSoap12";

export interface Getlibraryinfo {
    readonly GetlibraryinfoSoap: GetlibraryinfoSoap;
    readonly GetlibraryinfoSoap12: GetlibraryinfoSoap12;
}

import type { GetproductSoap } from "../ports/GetproductSoap";
import type { GetproductSoap12 } from "../ports/GetproductSoap12";

export interface Getproduct {
    readonly GetproductSoap: GetproductSoap;
    readonly GetproductSoap12: GetproductSoap12;
}

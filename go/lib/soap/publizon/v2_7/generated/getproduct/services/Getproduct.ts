import { GetproductSoap } from "../ports/GetproductSoap";
import { GetproductSoap12 } from "../ports/GetproductSoap12";

export interface Getproduct {
    readonly GetproductSoap: GetproductSoap;
    readonly GetproductSoap12: GetproductSoap12;
}

import { CreateloanSoap } from "../ports/CreateloanSoap";
import { CreateloanSoap12 } from "../ports/CreateloanSoap12";

export interface Createloan {
    readonly CreateloanSoap: CreateloanSoap;
    readonly CreateloanSoap12: CreateloanSoap12;
}

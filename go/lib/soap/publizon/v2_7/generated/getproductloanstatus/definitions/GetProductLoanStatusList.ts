import type { Ebookids } from "./Ebookids";

/** GetProductLoanStatusList */
export interface GetProductLoanStatusList {
    /** s:string */
    retailerid?: string;
    /** s:string */
    retailerkeycode?: string;
    /** ebookids */
    ebookids?: Ebookids;
    /** s:string */
    cardnumber?: string;
    /** s:string */
    clientid?: string;
}

import { Pid } from "./ids";
import { Nullable } from "./nullable";
import { OpensInType } from "@danskernesdigitalebibliotek/dpl-service-layer";

interface BasicDetails {
  authors: string;
  authorsShort: string;
  firstAuthor: string;
  pid: Pid;
  externalProductId: string;
  materialType: string;
  description: string;
  year: string;
  title: string;
  series: string;
  lang?: string;
  // Where a digital material opens. Set only for digital materials, used to
  // launch the reader or player directly; null for one nothing can open.
  opensIn: OpensInType;
}

export type BasicDetailsType = Nullable<Partial<BasicDetails>>;

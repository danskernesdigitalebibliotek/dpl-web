import { Pid } from "./ids";
import { Nullable } from "./nullable";
import { PublizonProductType } from "../../publizon/productType";

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
  // Publizon's product type enum (1 = ebook, 2 = audiobook, 4 = podcast).
  // Set only for digital materials, used to launch reader/player directly.
  digitalProductType: PublizonProductType;
}

export type BasicDetailsType = Nullable<Partial<BasicDetails>>;

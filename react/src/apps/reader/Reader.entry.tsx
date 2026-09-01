import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import Reader, { ReaderProps } from "../../components/reader-player/Reader";
import type { BiblioAdapterArgs } from "../../core/storybook/biblioAdapterArgs";
import type { WedoBooksArgs } from "../../core/storybook/wedobooksArgs";

// The SDK configuration and the lending flag are read deep inside the reader
// rather than passed down, so they never appear in ReaderProps - but they do
// arrive as data attributes, and Storybook needs them typed to offer them.
export type ReaderEntryType = Omit<ReaderProps, "onClose"> &
  Partial<BiblioAdapterArgs & WedoBooksArgs>;

const ReaderEntry: React.FC<ReaderEntryType> = ({
  identifier,
  orderid,
  loanid
}) => (
  <Reader
    identifier={identifier}
    orderid={orderid}
    loanid={loanid}
    // The reader is the whole page here, so closing it means leaving it.
    onClose={() => window.history.back()}
  />
);

export default withConfig(withUrls(withText(ReaderEntry)));

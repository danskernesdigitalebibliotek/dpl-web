import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import Reader, { ReaderProps } from "../../components/reader-player/Reader";

export type ReaderEntryType = Omit<ReaderProps, "onClose">;

const ReaderEntry: React.FC<ReaderEntryType> = (props) => (
  <Reader
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    // The reader is the whole page here, so closing it means leaving it.
    onClose={() => window.history.back()}
  />
);

export default withConfig(withUrls(withText(ReaderEntry)));

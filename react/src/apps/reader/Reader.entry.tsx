import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import Reader, { ReaderType } from "../../components/reader-player/Reader";
import BiblioReaderPlayer from "../../components/reader-player/BiblioReaderPlayer";

export type ReaderEntryType = ReaderType & {
  // Lowercase because it comes from the url via Drupal, like orderid.
  loanid?: string;
};

const ReaderEntry: React.FC<ReaderEntryType> = ({
  identifier,
  orderid,
  loanid
}) => {
  // Which reader opens the book is decided by the loan, not by the library's
  // current provider: a patron whose library has switched to Biblio still has
  // Publizon loans, and those only open in Publizon's reader.
  if (loanid) {
    return (
      <BiblioReaderPlayer
        loanId={loanid}
        // The reader or player is the whole page here, so closing it means
        // leaving it.
        onClose={() => window.history.back()}
      />
    );
  }

  return <Reader identifier={identifier} orderid={orderid} />;
};

export default withConfig(withUrls(withText(ReaderEntry)));

import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import Reader, { ReaderType } from "../../components/reader-player/Reader";
import BiblioReaderPlayer from "../../components/reader-player/BiblioReaderPlayer";
import BiblioSampleReaderPlayer from "../../components/reader-player/BiblioSampleReaderPlayer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";

export type ReaderEntryType = ReaderType & {
  // Lowercase because it comes from the url via Drupal, like orderid.
  loanid?: string;
  // Which kind of sample an identifier link asks for. A sample has no loan
  // to read the material type from, so the link carries it.
  sampletype?: string;
};

const ReaderEntry: React.FC<ReaderEntryType> = ({
  identifier,
  orderid,
  loanid,
  sampletype
}) => {
  const useBiblio = useBiblioAdapter();
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

  // An identifier with no loan behind it is a sample. With the flag on,
  // Biblio is the lending provider, so the sample goes through WeDoBooks and
  // Publizon is never asked to stand in. WeDoBooks only answers sample URLs
  // for a signed-in session, so the teaser buttons are disabled for anonymous
  // visitors - a hand-made link lands on an empty page rather than in the
  // service being left.
  if (identifier && !orderid && useBiblio) {
    return (
      <BiblioSampleReaderPlayer
        identifier={identifier}
        materialType={sampletype === "audiobook" ? "audiobook" : "ebook"}
        onClose={() => window.history.back()}
      />
    );
  }

  return <Reader identifier={identifier} orderid={orderid} />;
};

export default withConfig(withUrls(withText(ReaderEntry)));

import React from "react";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import DigitalReaderPlayer from "./DigitalReaderPlayer";
import DigitalSampleReader from "./DigitalSampleReader";
import PublizonReader from "./PublizonReader";

export type ReaderProps = {
  // Lowercase because these come from the url via Drupal.
  /** Publizon's key for a material, and the key a Publizon sample opens by. */
  identifier?: string;
  /** Publizon's key for a loan. */
  orderid?: string;
  /** The service layer's key for a loan. */
  loanid?: string;
  onClose: () => void;
};

/**
 * Opens whatever the reader page was pointed at.
 *
 * Callers hand over the url parameters and get the reader that can open them;
 * which one that is stays in here. The choice follows the loan rather than the
 * library's current provider, because a patron whose library has switched
 * still holds loans from before it, and each provider only recognises its own
 * keys.
 */
const Reader: React.FC<ReaderProps> = ({
  identifier,
  orderid,
  loanid,
  onClose
}) => {
  const viaBiblioAdapter = useBiblioAdapter();

  // A loan id is the service layer's key, and no Publizon loan has one.
  if (loanid) {
    return <DigitalReaderPlayer loanId={loanid} onClose={onClose} />;
  }

  // An identifier with no order behind it is an e-book sample (audiobooks
  // sample on the player page). With the flag on it goes through the service
  // layer, never Publizon; DigitalSampleReader explains the sign-in rule.
  if (identifier && !orderid && viaBiblioAdapter) {
    return <DigitalSampleReader identifier={identifier} onClose={onClose} />;
  }

  return <PublizonReader identifier={identifier} orderid={orderid} />;
};

export default Reader;

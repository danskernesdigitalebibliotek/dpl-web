import React from "react";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import DigitalReaderPlayer from "./DigitalReaderPlayer";
import DigitalSamplePlayer from "./DigitalSamplePlayer";

export type PlayerPageProps = {
  // Lowercase because these come from the url via Drupal.
  /** The material to sample - an identifier link with no loan behind it. */
  identifier?: string;
  /** The service layer's key for a loan. */
  loanid?: string;
  onClose: () => void;
};

/**
 * Opens whatever the player page was pointed at.
 *
 * The audiobook counterpart to `Reader`. Only WeDoBooks plays here: Publizon
 * audiobooks play in a modal on the page the patron came from, so no Publizon
 * key ever links to this page. The SDK's player bar pins itself to the bottom
 * of the viewport and leaves the rest of the page free - room this page owns,
 * unlike the reader, which takes the whole screen.
 */
const PlayerPage: React.FC<PlayerPageProps> = ({
  identifier,
  loanid,
  onClose
}) => {
  const viaBiblioAdapter = useBiblioAdapter();

  // The loan decides for itself whether it reads or plays - even an e-book
  // loan pasted here opens in the reader. See DigitalReaderPlayer.
  if (loanid) {
    return <DigitalReaderPlayer loanId={loanid} onClose={onClose} />;
  }

  // Same guard as the reader page's samples: with the flag on the service
  // layer is the lending provider, and it answers samples for signed-in
  // sessions only - a hand-made link lands on an empty page rather than in
  // the service being left.
  if (identifier && viaBiblioAdapter) {
    return <DigitalSamplePlayer identifier={identifier} onClose={onClose} />;
  }

  return null;
};

export default PlayerPage;

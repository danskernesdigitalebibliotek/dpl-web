import React from "react";
import { Button } from "../Buttons/Button";
import LinkButton from "../Buttons/LinkButton";
import { ButtonSize } from "../../core/utils/types/button";
import { DigitalProvider } from "../../core/utils/types/digital-provider";
import { playerUrl, playsInModal } from "./helper";

export type PlayerButtonProps = {
  /** The loan to play, by the key its provider knows it under. */
  orderId: string;
  /** Which provider issued the loan. Decides where it plays. */
  provider?: DigitalProvider | null;
  label: string;
  size: ButtonSize;
  dataCy: string;
  /**
   * Must return a promise: LinkButton navigates from `trackClick().then(...)`,
   * so a void return would throw there and swallow the navigation.
   */
  trackClick: () => Promise<unknown>;
  /**
   * What playing means for a Publizon loan: open its modal. Callers own the
   * `PlayerModal` itself, because they differ in where it is mounted.
   */
  onPlayInModal: () => void;
};

/**
 * Starts an audiobook loan, wherever that loan plays: Publizon's player lives
 * in a modal, a digital loan on the player page (see `PlayerPage`). Callers
 * ask for "play this loan" and get whichever the loan calls for.
 */
const PlayerButton: React.FC<PlayerButtonProps> = ({
  orderId,
  provider,
  label,
  size,
  dataCy,
  trackClick,
  onPlayInModal
}) => {
  if (!playsInModal(provider)) {
    return (
      <LinkButton
        url={playerUrl(orderId)}
        buttonType="none"
        variant="filled"
        size={size}
        dataCy={dataCy}
        trackClick={trackClick}
      >
        {label}
      </LinkButton>
    );
  }

  return (
    <Button
      dataCy={dataCy}
      label={label}
      buttonType="none"
      variant="filled"
      size={size}
      collapsible={false}
      disabled={false}
      onClick={() => {
        trackClick();
        onPlayInModal();
      }}
    />
  );
};

export default PlayerButton;

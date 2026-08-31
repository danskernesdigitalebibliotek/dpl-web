import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import PlayerPage, {
  PlayerPageProps
} from "../../components/reader-player/PlayerPage";
import type { BiblioAdapterArgs } from "../../core/storybook/biblioAdapterArgs";
import type { WedoBooksArgs } from "../../core/storybook/wedobooksArgs";

// The SDK configuration and the lending flag are read deep inside the player
// rather than passed down, so they never appear in PlayerPageProps - but they
// do arrive as data attributes, and Storybook needs them typed to offer them.
export type PlayerEntryType = Omit<PlayerPageProps, "onClose"> &
  Partial<BiblioAdapterArgs & WedoBooksArgs>;

const PlayerEntry: React.FC<PlayerEntryType> = ({ identifier, loanid }) => (
  <PlayerPage
    identifier={identifier}
    loanid={loanid}
    // The player is the whole page here, so closing it means leaving it.
    onClose={() => window.history.back()}
  />
);

export default withConfig(withUrls(withText(PlayerEntry)));

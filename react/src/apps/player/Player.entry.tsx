import React from "react";
import { withConfig } from "../../core/utils/config";
import { withUrls } from "../../core/utils/url";
import { withText } from "../../core/utils/text";
import PlayerPage, {
  PlayerPageProps
} from "../../components/reader-player/PlayerPage";

export type PlayerEntryType = Omit<PlayerPageProps, "onClose">;

const PlayerEntry: React.FC<PlayerEntryType> = (props) => (
  <PlayerPage
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    // The player is the whole page here, so closing it means leaving it.
    onClose={() => window.history.back()}
  />
);

export default withConfig(withUrls(withText(PlayerEntry)));

import React, { FC } from "react";
import { withText } from "../../core/utils/text";
import { withConfig } from "../../core/utils/config";
import { DataforsyningenArgs } from "../../core/storybook/dataforsyningenArgs";
import { BranchAddressSearchArgs } from "../../core/storybook/branchAddressSearchArgs";
import { GeoLocationArgs } from "../../core/storybook/geoLocationArgs";
import BranchList from "./branch-list";

interface BranchListEntryTextProps {
  branchListTitleText: string;
}

interface BranchListEntryConfigProps {
  branchesConfig: string;
}

const BranchListEntry: FC<
  BranchListEntryTextProps &
    BranchListEntryConfigProps &
    BranchAddressSearchArgs &
    DataforsyningenArgs &
    GeoLocationArgs
> = () => {
  return <BranchList />;
};

export default withConfig(withText(BranchListEntry));

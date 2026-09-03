import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import serviceUrlArgs from "../../core/storybook/serviceUrlArgs";
import { withConfig } from "../../core/utils/config";
import { getCurrentLocation } from "../../core/utils/helpers/url";
import { withUrls } from "../../core/utils/url";
import {
  AvailabilityLabel,
  AvailabilityLabelProps
} from "./availability-label";
import globalTextArgs from "../../core/storybook/globalTextArgs";
import globalConfigArgs from "../../core/storybook/globalConfigArgs";
import { AccessTypeCodeEnum } from "../../core/dbc-gateway/generated/graphql";

// The configuration below addresses the different variables,
// their default values, and how they translate into storybook
// controls.
// The label reads the blacklisted branches from config, so the story has to
// provide that entry alongside the component props.
type AvailabilityLabelStoryArgs = AvailabilityLabelProps & {
  blacklistedAvailabilityBranchesConfig: string;
};

const meta: Meta<AvailabilityLabelStoryArgs> = {
  title: "Components/Availability Label",
  component: AvailabilityLabel,
  argTypes: {
    ...serviceUrlArgs,
    ...globalTextArgs,
    ...globalConfigArgs,
    faustIds: {
      name: "Faust Ids",
      control: { type: "object" }
    },
    manifestText: {
      name: "Manifestation text",
      control: { type: "text" }
    },
    url: {
      name: "Link",
      control: { type: "text" }
    },
    selected: {
      name: "selected",
      control: { type: "boolean" }
    },
    cursorPointer: {
      name: "Cursor pointer",
      control: { type: "boolean" }
    },
    dataCy: {
      name: "Cypress data attribute",
      control: { type: "text" }
    },
    identifier: {
      name: "Digital identifier",
      control: { type: "text" }
    },
    accessTypes: {
      name: "Access types",
      options: [...Object.values(AccessTypeCodeEnum)],
      control: { type: "check" }
    },
    blacklistedAvailabilityBranchesConfig: {
      description: "Branches excluded from the availability lookup",
      control: { type: "text" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...globalTextArgs,
    ...globalConfigArgs,
    blacklistedAvailabilityBranchesConfig: "",
    faustIds: ["62523611"],
    cursorPointer: false,
    dataCy: "",
    identifier: null,
    accessTypes: [],
    manifestText: "Bog",
    url: new URL("/", getCurrentLocation()),
    selected: false
  },
  decorators: [
    (Story) => {
      const DecoratedStory = withUrls(withConfig(Story));
      return <DecoratedStory />;
    }
  ]
};

export default meta;

type Story = StoryObj<AvailabilityLabelStoryArgs>;

export const Available: Story = {
  args: {
    faustIds: ["61435867"]
  }
};

export const MoreThanOneID: Story = {
  args: {
    faustIds: ["62523611", "62150041", "61435867"]
  }
};

export const Selected: Story = {
  args: {
    faustIds: ["62523611"],
    manifestText: "lydbog (cd-mp3)",
    selected: true
  }
};

export const Unavailable: Story = {
  args: {
    faustIds: ["62523611"],
    manifestText: "ebog"
  }
};

export const EBogPrinsenHarry: Story = {
  args: {
    identifier: "9788763844123",
    manifestText: "ebog",
    accessTypes: [AccessTypeCodeEnum.Online]
  }
};

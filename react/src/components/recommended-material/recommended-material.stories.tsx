import type { Meta, StoryObj } from "@storybook/react";
import RecommendedMaterial from "./recommended-material";
import { coverImageUrls } from "../cover/helper";
import { getCurrentLocation } from "../../core/utils/helpers/url";
import { WorkId } from "../../core/utils/types/ids";
import { withText } from "../../core/utils/text";
import { withUrls } from "../../core/utils/url";
import serviceUrlArgs, {
  argTypes as serviceUrlArgTypes
} from "../../core/storybook/serviceUrlArgs";
import globalTextArgs, {
  argTypes as globalTextArgTypes
} from "../../core/storybook/globalTextArgs";
import globalConfigArgs, {
  argTypes as globalConfigArgTypes
} from "../../core/storybook/globalConfigArgs";

const WrappedRecommendedMaterial = withText(withUrls(RecommendedMaterial));

const meta: Meta<typeof WrappedRecommendedMaterial> = {
  title: "Components / Recommended Material",
  component: WrappedRecommendedMaterial,
  argTypes: {
    ...serviceUrlArgTypes,
    ...globalTextArgTypes,
    ...globalConfigArgTypes,
    title: {
      control: { type: "text" }
    },
    author: {
      control: { type: "text" }
    },
    coverUrl: {
      control: { type: "text" }
    },
    partOfGrid: {
      control: { type: "boolean" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...globalTextArgs,
    ...globalConfigArgs,
    wid: "work-of:870970-basis:22383590" as WorkId,
    title: "Brillebjørn på ferie",
    author: "Per Østergaard (f. 1950)",
    coverUrl: coverImageUrls.large,
    url: new URL("/work/work-of:870970-basis:22383590", getCurrentLocation()),
    partOfGrid: false,
    onAddToFavourites: () => {}
  }
};

export default meta;

type Story = StoryObj<typeof WrappedRecommendedMaterial>;

export const Default: Story = {};

export const WithoutCover: Story = {
  args: {
    coverUrl: null
  }
};

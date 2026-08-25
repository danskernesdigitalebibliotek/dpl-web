import type { Meta, StoryObj } from "@storybook/react";
import MaterialGrid from "./MaterialGrid";
import { MaterialGridItem } from "./helper";
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

const WrappedMaterialGrid = withText(withUrls(MaterialGrid));

const materials: MaterialGridItem[] = [...Array(12)].map((_, index) => ({
  wid: `work-of:870970-basis:2238359${index}` as WorkId,
  title: `Material title ${index + 1}`,
  author: "Per Østergaard (f. 1950)",
  coverUrl: coverImageUrls.large,
  url: new URL(
    `/work/work-of:870970-basis:2238359${index}`,
    getCurrentLocation()
  )
}));

const meta: Meta<typeof WrappedMaterialGrid> = {
  title: "Components / Material Grid",
  component: WrappedMaterialGrid,
  argTypes: {
    ...serviceUrlArgTypes,
    ...globalTextArgTypes,
    ...globalConfigArgTypes,
    title: {
      control: { type: "text" }
    },
    description: {
      control: { type: "text" }
    },
    buttonText: {
      control: { type: "text" }
    },
    initialMaximumDisplay: {
      control: { type: "number" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...globalTextArgs,
    ...globalConfigArgs,
    title: "Material grid",
    description: "A grid of materials",
    buttonText: "Show more",
    initialMaximumDisplay: 8,
    materials,
    onAddToFavourites: () => {}
  }
};

export default meta;

type Story = StoryObj<typeof WrappedMaterialGrid>;

export const Default: Story = {};

export const WithoutShowMoreButton: Story = {
  args: {
    materials: materials.slice(0, 4)
  }
};

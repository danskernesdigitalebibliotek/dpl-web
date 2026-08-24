import type { Meta, StoryObj } from "@storybook/react";
import globalConfigArgs, {
  argTypes as globalConfigArgTypes
} from "../../core/storybook/globalConfigArgs";
import globalTextArgs, {
  argTypes as globalTextArgTypes
} from "../../core/storybook/globalTextArgs";
import serviceUrlArgs, {
  argTypes as serviceUrlArgTypes
} from "../../core/storybook/serviceUrlArgs";
import mappArgs, {
  argTypes as mappArgTypes
} from "../../core/storybook/mappArgs";
import SeriesEntry from "./Series.entry";

const meta: Meta<typeof SeriesEntry> = {
  title: "Apps / Series",
  component: SeriesEntry,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: control types on the shared arg helpers are too wide
  argTypes: {
    ...globalTextArgTypes,
    ...serviceUrlArgTypes,
    ...globalConfigArgTypes,
    ...mappArgTypes,
    seriesId: {
      description: "Identifier of the series to display",
      control: { type: "text" }
    },
    seriesReadThisFirstText: {
      description: "Badge on the material to start the series with",
      control: { type: "text" }
    },
    seriesByAuthorText: {
      description: "Prefix on the byline above the series title",
      control: { type: "text" }
    },
    materialUrl: {
      description: "Path to the material page each card links to",
      control: { type: "text" }
    },
    byAuthorText: {
      description: "Prefix on the author line",
      control: { type: "text" }
    },
    etAlText: {
      description: "Suffix when a material has more than two creators",
      control: { type: "text" }
    },
    resultPagerStatusText: {
      description: "Status line above the show more button",
      control: { type: "text" }
    },
    showMoreText: {
      description: "Button loading the next page of members",
      control: { type: "text" }
    },
    blacklistedAvailabilityBranchesConfig: {
      description: "Branches excluded from the availability lookup",
      control: { type: "text" }
    }
  }
};

export default meta;

type Story = StoryObj<typeof SeriesEntry>;

export const Primary: Story = {
  args: {
    ...globalTextArgs,
    ...serviceUrlArgs,
    ...globalConfigArgs,
    ...mappArgs,
    blacklistedAvailabilityBranchesConfig: "",
    seriesId:
      "2cd6e951ab00b96487628d4bc23ed0c7adc64e1c394ecbe116c9e9b63297e10f",
    seriesReadThisFirstText: "Start with this one",
    seriesByAuthorText: "Series by",
    materialUrl: "/work/:workid",
    searchUrl: "/search",
    byAuthorText: "By",
    etAlText: "et al.",
    resultPagerStatusText: "Showing @itemsShown out of @hitcount results",
    showMoreText: "show more"
  }
};

// "Ravnenes hvisken": the series has a Del 0, and the entry to start with is
// deliberately not it. Del 0 should sort first, and the badge should land on a
// later row — showing that part order and the badge are independent.
export const WithPartZero: Story = {
  args: {
    ...Primary.args,
    seriesId: "3fa75f815bdd26f35a51980388dff42d320774d4eff66b9ed7804035c92ffadb"
  }
};

// A series with no description. Depends on live DBC data, so it will quietly
// stop covering that case if a description is ever added to this series.
export const WithoutDescription: Story = {
  args: {
    ...Primary.args,
    seriesId: "af0541e7bc9b26694672b12727f0dd61367a92b60ea56db941c9a037900feb7a"
  }
};

// A series id that does not resolve, exercising the null branch in Series.tsx.
export const NotFound: Story = {
  args: {
    ...Primary.args,
    seriesId: "does-not-exist"
  }
};

// "Walt Disney's jumbobog": at 622 members the longest series we know of -
// several pages of "show more", and common enough to exist in most library
// profiles. The same series on bibliotek.dk:
// https://bibliotek.dk/serie/cd47f213997d2f3b8f29c51057b38fe415177af7b86b054de4065c9525e3627a
export const WithManyMembers: Story = {
  args: {
    ...Primary.args,
    seriesId: "cd47f213997d2f3b8f29c51057b38fe415177af7b86b054de4065c9525e3627a"
  }
};

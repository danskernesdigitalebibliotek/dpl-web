import type { Meta, StoryObj } from "@storybook/react";
import PlayerEntry from "./Player.entry";
import serviceUrlArgs, {
  argTypes as serviceUrlArgTypes
} from "../../core/storybook/serviceUrlArgs";
import biblioAdapterArgs, {
  argTypes as biblioAdapterArgTypes
} from "../../core/storybook/biblioAdapterArgs";
import wedobooksArgs, {
  argTypes as wedobooksArgTypes
} from "../../core/storybook/wedobooksArgs";

/**
 * The player page, which is WeDoBooks-only.
 *
 * There is no Publizon counterpart to this file on purpose: Publizon
 * audiobooks play in a modal on the material page, so no Publizon key ever
 * links here - see `ReaderPlayer / Player / Publizon` for that player.
 *
 * Same three requirements as the WeDoBooks reader - the five SDK values from
 * `STORYBOOK_WEDOBOOKS_*`, a signed-in patron from `STORYBOOK_USER_TOKEN`,
 * and an audiobook WeDoBooks knows. The page renders empty if any is missing,
 * and the console says which.
 */
const meta: Meta<typeof PlayerEntry> = {
  title: "ReaderPlayer / Player / WeDoBooks",
  component: PlayerEntry,
  argTypes: {
    ...serviceUrlArgTypes,
    ...biblioAdapterArgTypes,
    ...wedobooksArgTypes,
    identifier: {
      description: "The audiobook to sample, by its WeDoBooks material id.",
      control: { type: "text" }
    },
    loanid: {
      description:
        "The service layer's key for a loan. An e-book loan pasted here " +
        "opens in the reader instead - the loan decides, not the address.",
      control: { type: "text" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...biblioAdapterArgs,
    ...wedobooksArgs,
    // Without the flag this page renders nothing at all, which is the whole
    // of its behaviour for a library that has not switched.
    useBiblioAdapterConfig: "1"
  }
};

export default meta;

type Story = StoryObj<typeof PlayerEntry>;

/** An audiobook loan, opened through the service layer. Needs a real loan id. */
export const Loan: Story = {
  args: {
    loanid: ""
  }
};

/** An audiobook sample. Signed-in only, which is WeDoBooks' own restriction. */
export const Sample: Story = {
  args: {
    identifier: ""
  }
};

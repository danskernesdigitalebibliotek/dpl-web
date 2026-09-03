import type { Meta, StoryObj } from "@storybook/react";
import ReaderEntry from "./Reader.entry";
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
 * The reader page opening a WeDoBooks book.
 *
 * Kept apart from the Publizon stories because the two readers share nothing
 * but the page they mount on: different provider, different keys, different
 * credentials. Which one opens is decided from the url parameters, so these
 * stories are the ways this page can be reached - not variations of one
 * component.
 *
 * Three things must be in place, and the page renders empty if any is
 * missing - the console says which:
 *
 *  1. The five SDK values, from `STORYBOOK_WEDOBOOKS_*` in the root .env
 *     (`task dev:dotenv:generate`). Storybook reads the environment at
 *     startup, so restart it after regenerating.
 *  2. A signed-in patron, from `STORYBOOK_USER_TOKEN`. Every step is
 *     patron-scoped - the SDK session is minted for a person.
 *  3. A loan id or material id WeDoBooks actually knows.
 */
const meta: Meta<typeof ReaderEntry> = {
  title: "ReaderPlayer / Reader / WeDoBooks",
  component: ReaderEntry,
  argTypes: {
    ...serviceUrlArgTypes,
    ...biblioAdapterArgTypes,
    ...wedobooksArgTypes,
    identifier: {
      description: "The material to sample, by its WeDoBooks material id.",
      control: { type: "text" }
    },
    loanid: {
      description: "The service layer's key for a loan.",
      control: { type: "text" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...biblioAdapterArgs,
    ...wedobooksArgs,
    // The flag that makes the service layer the lending provider. Without it
    // this page falls through to Publizon - which is the Publizon stories'
    // subject, not this file's.
    useBiblioAdapterConfig: "1"
  }
};

export default meta;

type Story = StoryObj<typeof ReaderEntry>;

/** An e-book loan, opened through the service layer. Needs a real loan id. */
export const Loan: Story = {
  args: {
    loanid: ""
  }
};

/**
 * An e-book sample. Signed-in only: WeDoBooks answers sample urls solely for
 * an authenticated session, which is why the teaser buttons are disabled for
 * anonymous visitors.
 */
export const Sample: Story = {
  args: {
    identifier: ""
  }
};

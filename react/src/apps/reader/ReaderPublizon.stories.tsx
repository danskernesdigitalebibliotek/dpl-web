import type { Meta, StoryObj } from "@storybook/react";
import ReaderEntry from "./Reader.entry";
import serviceUrlArgs, {
  argTypes as serviceUrlArgTypes
} from "../../core/storybook/serviceUrlArgs";
import biblioAdapterArgs, {
  argTypes as biblioAdapterArgTypes
} from "../../core/storybook/biblioAdapterArgs";

/**
 * The reader page opening a Publizon loan, in pubhub's own reader.
 *
 * The counterpart to the WeDoBooks stories. No SDK configuration here: this
 * reader is an iframe pubhub serves, so it needs nothing from WeDoBooks.
 *
 * The lending flag is left off by default, which is the state of a library
 * that has not switched. `LoanAfterSwitching` covers the case that outlives
 * the switch: a patron holds Publizon loans from before it, and those must
 * keep opening in Publizon's reader even with the flag on - neither provider
 * recognises the other's keys.
 */
const meta: Meta<typeof ReaderEntry> = {
  title: "ReaderPlayer / Reader / Publizon",
  component: ReaderEntry,
  argTypes: {
    ...serviceUrlArgTypes,
    ...biblioAdapterArgTypes,
    identifier: {
      description:
        "Publizon's key for a material. Opens a sample - do not combine " +
        "with orderid.",
      control: { type: "text" }
    },
    orderid: {
      description:
        "Publizon's key for a loan - do not combine with identifier.",
      control: { type: "text" }
    }
  },
  args: {
    ...serviceUrlArgs,
    ...biblioAdapterArgs
  }
};

export default meta;

type Story = StoryObj<typeof ReaderEntry>;

/** A sample, by Publizon identifier. */
export const Sample: Story = {
  args: {
    identifier: "9788793681095"
  }
};

/** A loan, by Publizon order id. Works only for a material on loan. */
export const Loan: Story = {
  args: {
    orderid: ""
  }
};

/** A Publizon loan held by a patron whose library has switched to WeDoBooks. */
export const LoanAfterSwitching: Story = {
  args: {
    useBiblioAdapterConfig: "1",
    orderid: ""
  }
};

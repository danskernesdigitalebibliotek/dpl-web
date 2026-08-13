import { readEnv } from "../utils/helpers/env";

export const argTypes = {
  dataforsyningenTokenConfig: {
    description: "Dataforsyningen API token",
    control: { type: "text" }
  }
};

export default {
  dataforsyningenTokenConfig: readEnv("STORYBOOK_DATAFORSYNINGEN") || ""
};

export interface DataforsyningenArgs {
  dataforsyningenTokenConfig: string;
}

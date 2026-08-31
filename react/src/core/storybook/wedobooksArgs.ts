import { readEnv } from "../utils/helpers/env";

/**
 * The WeDoBooks SDK configuration, for Storybook.
 *
 * In a mounted app these five arrive from the CMS, which reads them from its
 * own `WEDOBOOKS_*` environment variables and ships them as data attributes.
 * Storybook has no CMS in front of it, so it reads them from the environment
 * directly - hence the `STORYBOOK_` prefix, the only one the Storybook build
 * exposes to the bundle. Populate them from 1Password with
 * `task dev:dotenv:generate`.
 *
 * They identify our application to WeDoBooks and say nothing about which
 * patron is reading; a story still needs a signed-in session for that, from
 * `STORYBOOK_USER_TOKEN`.
 */
export const argTypes = {
  wedobooksApplicationIdConfig: {
    description: "WeDoBooks application id",
    control: { type: "text" } as const
  },
  wedobooksFirebaseApiKeyConfig: {
    description: "Firebase API key for the WeDoBooks project",
    control: { type: "text" } as const
  },
  wedobooksFirebaseProjectIdConfig: {
    description: "Firebase project id for the WeDoBooks project",
    control: { type: "text" } as const
  },
  wedobooksFirebaseAppIdConfig: {
    description: "Firebase app id for the WeDoBooks project",
    control: { type: "text" } as const
  },
  wedobooksReaderApiKeyConfig: {
    description: "WeDoBooks reader API key",
    control: { type: "text" } as const
  }
};

export default {
  wedobooksApplicationIdConfig:
    readEnv("STORYBOOK_WEDOBOOKS_APPLICATION_ID") || "",
  wedobooksFirebaseApiKeyConfig:
    readEnv("STORYBOOK_WEDOBOOKS_FIREBASE_API_KEY") || "",
  wedobooksFirebaseProjectIdConfig:
    readEnv("STORYBOOK_WEDOBOOKS_FIREBASE_PROJECT_ID") || "",
  wedobooksFirebaseAppIdConfig:
    readEnv("STORYBOOK_WEDOBOOKS_FIREBASE_APP_ID") || "",
  wedobooksReaderApiKeyConfig:
    readEnv("STORYBOOK_WEDOBOOKS_READER_API_KEY") || ""
};

export interface WedoBooksArgs {
  wedobooksApplicationIdConfig: string;
  wedobooksFirebaseApiKeyConfig: string;
  wedobooksFirebaseProjectIdConfig: string;
  wedobooksFirebaseAppIdConfig: string;
  wedobooksReaderApiKeyConfig: string;
}

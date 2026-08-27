import { useConfig } from "../../core/utils/config";

/**
 * What the WeDoBooks SDK needs to start in the browser.
 *
 * Mirrors the SDK's own configuration object. The values identify our
 * application to WeDoBooks; they say nothing about which patron is reading -
 * that comes from the sign-in token the adapter mints.
 */
export type ReaderSdkConfig = {
  applicationId: string;
  firebaseApiKey: string;
  firebaseProjectId: string;
  firebaseAppId: string;
  readerApiKey: string;
};

const configKeys = {
  applicationId: "wedobooksApplicationIdConfig",
  firebaseApiKey: "wedobooksFirebaseApiKeyConfig",
  firebaseProjectId: "wedobooksFirebaseProjectIdConfig",
  firebaseAppId: "wedobooksFirebaseAppIdConfig",
  readerApiKey: "wedobooksReaderApiKeyConfig"
} as const;

/**
 * The SDK configuration the CMS ships, or null when the site has none.
 *
 * The CMS leaves the keys out entirely unless all five are set, so a missing
 * key means "this site cannot run the WeDoBooks reader" rather than a
 * misconfiguration to report. Callers fall back to not offering the material,
 * which is what a library that has not finished the switch should see.
 */
const useReaderSdkConfig = (): ReaderSdkConfig | null => {
  const config = useConfig();

  try {
    return {
      applicationId: config(configKeys.applicationId),
      firebaseApiKey: config(configKeys.firebaseApiKey),
      firebaseProjectId: config(configKeys.firebaseProjectId),
      firebaseAppId: config(configKeys.firebaseAppId),
      readerApiKey: config(configKeys.readerApiKey)
    };
  } catch {
    // Mirrors the warning Reader gives for a missing identifier: without it a
    // site that has not been given its WeDoBooks credentials renders an empty
    // reader page with nothing at all to go on.
    // eslint-disable-next-line no-console
    console.warn(
      "The WeDoBooks reader and player need all five wedobooks* configs. " +
        "The CMS serves them from the WEDOBOOKS_* environment variables, " +
        "which must all be set."
    );
    return null;
  }
};

export default useReaderSdkConfig;

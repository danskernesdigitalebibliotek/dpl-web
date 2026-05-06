import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { wedobooks } from "library-service";

// Library / org claims embedded in the custom sign-in token. Without these,
// the SDK's `loanBook` returns success: false and `canLoan` returns
// orgId: null. STORYBOOK_WEDOBOOKS_USER_DATA can override (JSON string).
function resolveUserData() {
  const raw = process.env.STORYBOOK_WEDOBOOKS_USER_DATA;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to default
    }
  }
  return {
    type: "library" as const,
    organization_third_party_id:
      process.env.STORYBOOK_WEDOBOOKS_THIRD_PARTY_ID || "test2"
  };
}

function LibraryServiceSmoke() {
  return (
    <wedobooks.SmokeHarness
      sdkConfig={{
        applicationId: process.env.STORYBOOK_WEDOBOOKS_APPLICATION_ID || "",
        firebaseApiKey: process.env.STORYBOOK_WEDOBOOKS_FIREBASE_API_KEY || "",
        firebaseProjectId:
          process.env.STORYBOOK_WEDOBOOKS_FIREBASE_PROJECT_ID || "",
        firebaseAppId: process.env.STORYBOOK_WEDOBOOKS_FIREBASE_APP_ID || "",
        readerApiKey: process.env.STORYBOOK_WEDOBOOKS_READER_API_KEY || ""
      }}
      authConfig={{
        baseUrl: process.env.STORYBOOK_WEDOBOOKS_API_BASE_URL || "",
        apiKey: process.env.STORYBOOK_WEDOBOOKS_API_KEY || ""
      }}
      defaultEmail={process.env.STORYBOOK_WEDOBOOKS_TEST_EMAIL || ""}
      defaultPassword={process.env.STORYBOOK_WEDOBOOKS_TEST_PASSWORD || ""}
      userData={resolveUserData()}
    />
  );
}

const meta: Meta<typeof LibraryServiceSmoke> = {
  title: "library-service / smoke",
  component: LibraryServiceSmoke
};

export default meta;

type Story = StoryObj<typeof LibraryServiceSmoke>;

export const Primary: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { wedobooks } from "library-service";

type Status =
  | { kind: "ok"; hasReader: boolean; hasAudio: boolean }
  | { kind: "error"; message: string };

// Small ad-hoc component used purely to verify that the library-service
// package resolves at build time, the bundled SDK loads at runtime, and
// `createLibraryService` returns a usable instance.
function LibraryServiceSmoke() {
  const [status, setStatus] = React.useState<Status | null>(null);

  React.useEffect(() => {
    try {
      const sdk = wedobooks.createLibraryService({
        applicationId: process.env.STORYBOOK_WEDOBOOKS_APPLICATION_ID || "",
        firebaseApiKey: process.env.STORYBOOK_WEDOBOOKS_FIREBASE_API_KEY || "",
        firebaseProjectId: process.env.STORYBOOK_WEDOBOOKS_FIREBASE_PROJECT_ID || "",
        firebaseAppId: process.env.STORYBOOK_WEDOBOOKS_FIREBASE_APP_ID || "",
        readerApiKey: process.env.STORYBOOK_WEDOBOOKS_READER_API_KEY || ""
      });
      setStatus({
        kind: "ok",
        hasReader: typeof wedobooks.openReader === "function",
        hasAudio: typeof wedobooks.openPlayerBar === "function"
      });
      // eslint-disable-next-line no-console
      console.log("library-service SDK instance:", sdk);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }, []);

  return (
    <section style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>library-service smoke test</h1>
      {status?.kind === "ok" && (
        <ul>
          <li>
            <strong>SDK constructed:</strong> yes
          </li>
          <li>
            <strong>openReader available:</strong> {String(status.hasReader)}
          </li>
          <li>
            <strong>openPlayerBar available:</strong> {String(status.hasAudio)}
          </li>
          <li>Check the browser console for the full SDK instance.</li>
        </ul>
      )}
      {status?.kind === "error" && (
        <pre style={{ color: "crimson" }}>Error: {status.message}</pre>
      )}
    </section>
  );
}

const meta: Meta<typeof LibraryServiceSmoke> = {
  title: "library-service / smoke",
  component: LibraryServiceSmoke
};

export default meta;

type Story = StoryObj<typeof LibraryServiceSmoke>;

export const Primary: Story = {};

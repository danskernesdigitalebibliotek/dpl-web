import { getEnv, getServerEnv } from "@/lib/config/env"
import LibraryServiceTestClient from "./LibraryServiceTestClient"

// Server component: resolves env (including server-only WeDoBooks keys) and
// hands it to the client component as props. Server-only values still end up
// in the rendered HTML, but keeping them out of the client env schema avoids
// leaking them through `NEXT_PUBLIC_*` variables visible in build artifacts.
export default function LibraryServiceTestPage() {
  return (
    <LibraryServiceTestClient
      sdkConfig={{
        applicationId: getEnv("WEDOBOOKS_APPLICATION_ID") ?? "",
        firebaseApiKey: getEnv("WEDOBOOKS_FIREBASE_API_KEY") ?? "",
        firebaseProjectId: getEnv("WEDOBOOKS_FIREBASE_PROJECT_ID") ?? "",
        firebaseAppId: getEnv("WEDOBOOKS_FIREBASE_APP_ID") ?? "",
        readerApiKey: getServerEnv("WEDOBOOKS_READER_API_KEY") ?? "",
      }}
      authConfig={{
        baseUrl: getServerEnv("WEDOBOOKS_API_BASE_URL") ?? "",
        apiKey: getServerEnv("WEDOBOOKS_API_KEY") ?? "",
      }}
    />
  )
}

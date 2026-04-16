import { getEnv, getServerEnv } from "@/lib/config/env"
import LibraryServiceTestClient from "./LibraryServiceTestClient"

// Server component: resolves env (including server-only `readerApiKey`) and
// hands it to the client component as a prop. This keeps the server-only key
// out of the client bundle while still making it available to the SDK.
export default function LibraryServiceTestPage() {
  return (
    <LibraryServiceTestClient
      config={{
        applicationId: getEnv("WEDOBOOKS_APPLICATION_ID") ?? "",
        firebaseApiKey: getEnv("WEDOBOOKS_FIREBASE_API_KEY") ?? "",
        firebaseProjectId: getEnv("WEDOBOOKS_FIREBASE_PROJECT_ID") ?? "",
        firebaseAppId: getEnv("WEDOBOOKS_FIREBASE_APP_ID") ?? "",
        readerApiKey: getServerEnv("WEDOBOOKS_READER_API_KEY") ?? "",
      }}
    />
  )
}

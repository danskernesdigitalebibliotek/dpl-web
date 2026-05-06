"use client"
import { wedobooks } from "library-service"

type Props = {
  sdkConfig: wedobooks.LibraryServiceConfig
  authConfig: { baseUrl: string; apiKey: string }
}

export default function LibraryServiceTestClient({ sdkConfig, authConfig }: Props) {
  return <wedobooks.SmokeHarness sdkConfig={sdkConfig} authConfig={authConfig} />
}

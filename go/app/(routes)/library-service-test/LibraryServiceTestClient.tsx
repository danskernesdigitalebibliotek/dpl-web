"use client"
import { useEffect, useState } from "react"
import { wedobooks } from "library-service"

type Status =
  | { kind: "ok"; hasReader: boolean; hasAudio: boolean }
  | { kind: "error"; message: string }

type Props = {
  config: wedobooks.LibraryServiceConfig
}

export default function LibraryServiceTestClient({ config }: Props) {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    try {
      const sdk = wedobooks.createLibraryService(config)
      setStatus({
        kind: "ok",
        hasReader: typeof wedobooks.openReader === "function",
        hasAudio: typeof wedobooks.openPlayerBar === "function",
      })
      // eslint-disable-next-line no-console
      console.log("library-service SDK instance:", sdk)
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : String(err) })
    }
  }, [config])

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
  )
}

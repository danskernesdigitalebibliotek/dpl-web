import * as React from "react"
import { createLibraryService, type LibraryService } from "./index"
import {
  signInWithPassword,
  createSignInToken,
  type CreateSignInTokenConfig,
  type SignInWithPasswordConfig,
} from "./auth"
import type { LibraryServiceConfig } from "./types"

const TEST_EBOOKS = ["9788758841038", "9788758853147"]
const TEST_AUDIOBOOKS = ["9788758855769"]

export interface SmokeHarnessProps {
  sdkConfig: LibraryServiceConfig
  /** Base URL + x-api-key for the WeDoBooks REST API (sign-in / create-sign-in-token). */
  authConfig: { baseUrl: string; apiKey: string }
  defaultEmail?: string
  defaultPassword?: string
  /**
   * Optional library / org claims to embed in the custom sign-in token.
   * Without these the SDK's loan calls return `orgId: null` and refuse to loan.
   */
  userData?: CreateSignInTokenConfig["userData"]
}

type LogEntry = { time: string; message: string; error?: boolean }

function appendLog(
  entries: LogEntry[],
  message: string,
  error = false,
): LogEntry[] {
  return [...entries, { time: new Date().toLocaleTimeString(), message, error }]
}

/**
 * Interactive smoke-test harness for the WeDoBooks SDK wrapper.
 *
 * Renders the full PoC flow — email/password sign-in, custom-token sign-in,
 * canLoan / loanBook on a handful of test ISBNs, refresh loans, and reader /
 * player render targets — plus a running log panel. Designed to be dropped
 * into any React host (Storybook, Next.js, plain Vite app) so the same UI
 * verifies the integration in every surface.
 */
export function SmokeHarness({
  sdkConfig,
  authConfig,
  defaultEmail = "",
  defaultPassword = "",
  userData,
}: SmokeHarnessProps): React.ReactElement {
  const [service, setService] = React.useState<LibraryService | null>(null)
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [loans, setLoans] = React.useState<unknown[]>([])
  const readerRef = React.useRef<HTMLDivElement>(null)
  const playerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    try {
      const svc = createLibraryService(sdkConfig)
      setService(svc)
      setLogs((l) => appendLog(l, "SDK initialized"))
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `SDK init failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }, [sdkConfig])

  const handleSignInWithPassword = async (email: string, password: string) => {
    if (!service) return
    if (!authConfig.baseUrl || !authConfig.apiKey) {
      setLogs((l) =>
        appendLog(l, "Missing authConfig.baseUrl or authConfig.apiKey", true),
      )
      return
    }

    try {
      setLogs((l) => appendLog(l, "Step 1: signInWithPassword…"))
      const { id_token } = await signInWithPassword({
        baseUrl: authConfig.baseUrl,
        apiKey: authConfig.apiKey,
        email,
        password,
      } satisfies SignInWithPasswordConfig)

      const payload = JSON.parse(atob(id_token.split(".")[1]))
      const userId: string = payload.sub || payload.user_id || ""
      setLogs((l) =>
        appendLog(l, `signInWithPassword: got id_token, uid=${userId}`),
      )

      setLogs((l) =>
        appendLog(
          l,
          `Step 2: createSignInToken (userData=${userData ? JSON.stringify(userData) : "none"})…`,
        ),
      )
      const { token } = await createSignInToken({
        baseUrl: authConfig.baseUrl,
        apiKey: authConfig.apiKey,
        bearerToken: id_token,
        userId,
        createIfNotExists: true,
        userData,
      })
      // Decode the custom token's payload so we can see what claims (orgId,
      // libraryId, etc.) actually made it in. Log the full token to the
      // browser console for manual inspection / copy out.
      let decodedClaims: unknown = null
      try {
        decodedClaims = JSON.parse(atob(token.split(".")[1]))
      } catch {
        decodedClaims = "<failed to decode>"
      }
      // eslint-disable-next-line no-console
      console.log("[SmokeHarness] custom token:", token)
      // eslint-disable-next-line no-console
      console.log("[SmokeHarness] custom token claims:", decodedClaims)
      setLogs((l) =>
        appendLog(
          l,
          `createSignInToken: got token (${token.slice(0, 20)}…) claims=${JSON.stringify(decodedClaims)}`,
        ),
      )

      setLogs((l) => appendLog(l, "Step 3: sdk.signIn(token)…"))
      const result = await service.signIn(token)
      setLogs((l) =>
        appendLog(
          l,
          `signIn: success=${result?.success}, uid=${service.currentUserId}`,
        ),
      )
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `Sign-in failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }

  const handleCanLoan = async (isbn: string) => {
    if (!service) return
    try {
      const result = await service.canLoan({ materialId: isbn })
      setLogs((l) => appendLog(l, `canLoan(${isbn}): ${JSON.stringify(result)}`))
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `canLoan failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }

  const handleGetLoans = React.useCallback(async () => {
    if (!service) return
    const uid = service.currentUserId
    if (!uid) {
      setLogs((l) => appendLog(l, "getLoans: not signed in", true))
      return
    }
    try {
      const result = await service.getLoans(uid)
      setLoans(result)
      setLogs((l) => appendLog(l, `getLoans: ${result.length} loan(s) found`))
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `getLoans failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }, [service])

  const handleLoan = async (isbn: string) => {
    if (!service) return
    try {
      const result = await service.loanBook(isbn)
      setLogs((l) => appendLog(l, `loanBook(${isbn}): ${JSON.stringify(result)}`))
      if (result.success) {
        await handleGetLoans()
      }
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `loanBook failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }

  const handleOpenReader = async (checkout: unknown) => {
    if (!service || !readerRef.current) return
    try {
      readerRef.current.innerHTML = ""
      await service.openReader({
        checkout,
        element: readerRef.current,
        callbacks: {
          onClose: () => setLogs((l) => appendLog(l, "Reader: onClose")),
          onFinishBookClick: () =>
            setLogs((l) => appendLog(l, "Reader: onFinishBookClick")),
        },
      })
      setLogs((l) => appendLog(l, "openReader: success"))
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `openReader failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }

  const handleOpenPlayerBar = async (checkout: unknown) => {
    if (!service || !playerRef.current) return
    try {
      playerRef.current.innerHTML = ""
      await service.openPlayerBar({
        checkout,
        element: playerRef.current,
        callbacks: {
          onClose: () => setLogs((l) => appendLog(l, "PlayerBar: onClose")),
        },
      })
      setLogs((l) => appendLog(l, "openPlayerBar: success"))
    } catch (err) {
      setLogs((l) =>
        appendLog(
          l,
          `openPlayerBar failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        ),
      )
    }
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 800,
      }}
    >
      <h1>library-service test</h1>

      <Section title="1. Sign In">
        <p style={{ fontSize: 13, color: "#666" }}>
          Full auth flow: signInWithPassword → createSignInToken → sdk.signIn
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const email = fd.get("email") as string
            const password = fd.get("password") as string
            if (email && password) handleSignInWithPassword(email, password)
          }}
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={defaultEmail}
            style={{ width: "100%", padding: 8, marginBottom: 4, fontSize: 13 }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            defaultValue={defaultPassword}
            style={{ width: "100%", padding: 8, marginBottom: 4, fontSize: 13 }}
          />
          <button type="submit" style={{ marginTop: 4 }}>
            Sign In with Password
          </button>
        </form>
        {service?.currentUserId && (
          <p>
            Signed in as: <code>{service.currentUserId}</code>
          </p>
        )}
      </Section>

      <Section title="2. Test Books">
        <p style={{ fontSize: 13, color: "#666" }}>
          Third-party: <strong>test2</strong> (Reload test library)
        </p>
        <h4>Ebooks</h4>
        {TEST_EBOOKS.map((isbn) => (
          <div key={isbn} style={{ marginBottom: 4 }}>
            <code>{isbn}</code>{" "}
            <button onClick={() => handleCanLoan(isbn)}>canLoan</button>{" "}
            <button onClick={() => handleLoan(isbn)}>loanBook</button>
          </div>
        ))}
        <h4>Audiobooks</h4>
        {TEST_AUDIOBOOKS.map((isbn) => (
          <div key={isbn} style={{ marginBottom: 4 }}>
            <code>{isbn}</code>{" "}
            <button onClick={() => handleCanLoan(isbn)}>canLoan</button>{" "}
            <button onClick={() => handleLoan(isbn)}>loanBook</button>
          </div>
        ))}
      </Section>

      <Section title="3. Active Loans">
        <button onClick={handleGetLoans}>Refresh Loans</button>
        {loans.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {loans.map((loan, i) => {
              const l = loan as {
                id?: string
                title?: string
                material_id?: string
                material_type?: string
              }
              return (
                <li
                  key={l.id ?? i}
                  style={{
                    padding: 8,
                    margin: "8px 0",
                    background: "#f5f5f5",
                    borderRadius: 4,
                  }}
                >
                  <strong>{l.title ?? "Unknown"}</strong>{" "}
                  <code style={{ fontSize: 11 }}>{l.material_id}</code>{" "}
                  <em>({l.material_type})</em>
                  <br />
                  <button
                    onClick={() =>
                      l.material_type === "audiobook"
                        ? handleOpenPlayerBar(loan)
                        : handleOpenReader(loan)
                    }
                    style={{ marginTop: 4 }}
                  >
                    {l.material_type === "audiobook" ? "Open Player" : "Open Reader"}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      <Section title="4. Reader">
        <div
          ref={readerRef}
          style={{
            width: "100%",
            height: 500,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
      </Section>

      <Section title="5. Player">
        <div
          ref={playerRef}
          style={{
            width: "100%",
            minHeight: 80,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
      </Section>

      <Section title="Log">
        <div
          style={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
            fontFamily: "monospace",
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          {logs.length === 0 && (
            <span style={{ color: "#666" }}>No logs yet…</span>
          )}
          {logs.map((entry, i) => (
            <div key={i} style={{ color: entry.error ? "#f44" : "#8f8" }}>
              <span style={{ color: "#888" }}>[{entry.time}]</span>{" "}
              {entry.message}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: 4 }}>
        {title}
      </h3>
      {children}
    </section>
  )
}

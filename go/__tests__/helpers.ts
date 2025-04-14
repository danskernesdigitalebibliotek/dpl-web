import { vi, test as vitestTest } from "vitest"

type ConsoleSpy = {
  error: ReturnType<typeof vi.spyOn>
  info: ReturnType<typeof vi.spyOn>
}

/**
 * Helper function to silence console output during a test.
 * Usage:
 * ```ts
 * test("my test", async () => {
 *   const { restoreConsole } = withSilencedConsole()
 *   // ... test code that might produce console output ...
 *   restoreConsole()
 * })
 * ```
 */
export function withSilencedConsole() {
  const consoleSpy: ConsoleSpy = {
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
  }

  return {
    restoreConsole: () => {
      consoleSpy.error.mockRestore()
      consoleSpy.info.mockRestore()
    },
  }
}

/**
 * Custom test wrapper that automatically silences console output.
 * Usage:
 * ```ts
 * testSilently("my test", async () => {
 *   // ... test code that might produce console output ...
 * })
 * ```
 */
export const testSilently = (name: string, fn: () => void | Promise<void>, timeout?: number) => {
  vitestTest(
    name,
    async () => {
      const { restoreConsole } = withSilencedConsole()
      try {
        await fn()
      } finally {
        restoreConsole()
      }
    },
    timeout
  )
}

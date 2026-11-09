import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useSyncExternalStore } from "react"

import {
  type ConnectionSettings,
  getConnectionSettings,
  setConnectionSettings,
  subscribeToConnectionSettings,
} from "./connectionSettings"

/** The pasted tokens and urls, plus a save that refetches everything with them. */
export const useConnectionSettings = () => {
  const queryClient = useQueryClient()
  const settings = useSyncExternalStore(subscribeToConnectionSettings, getConnectionSettings)

  const saveSettings = useCallback(
    (nextSettings: ConnectionSettings) => {
      setConnectionSettings(nextSettings)
      queryClient.resetQueries()
    },
    [queryClient]
  )

  return { settings, saveSettings }
}

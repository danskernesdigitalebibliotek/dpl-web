import { type FormEvent, useEffect, useRef, useState } from "react"

import type { ConnectionSettings } from "./connectionSettings"
import { useConnectionSettings } from "./useConnectionSettings"

const fields: { name: keyof ConnectionSettings; label: string }[] = [
  { name: "libraryToken", label: "Library token" },
  { name: "userToken", label: "User token (optional – enables patron data)" },
  { name: "fbiUrl", label: "FBI url" },
  { name: "fbsUrl", label: "FBS url" },
]

/**
 * Where tokens are pasted, like the token stories in react/'s Storybook: a
 * floating button opening a modal dialog, which opens by itself while no
 * library token is set.
 */
export const ConnectionPanel = () => {
  const { settings, saveSettings } = useConnectionSettings()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Remounting the form on every open discards edits from a cancelled visit.
  const [openCount, setOpenCount] = useState(0)

  const openDialog = () => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      setOpenCount((count) => count + 1)
      dialog.showModal()
    }
  }

  const closeDialog = () => dialogRef.current?.close()

  useEffect(() => {
    if (!settings.libraryToken) {
      openDialog()
    }
    // Only on first render: later, the user decides when to open it.
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    saveSettings({
      libraryToken: String(formData.get("libraryToken")).trim(),
      userToken: String(formData.get("userToken")).trim(),
      fbiUrl: String(formData.get("fbiUrl")).trim(),
      fbsUrl: String(formData.get("fbsUrl")).trim(),
    })
    closeDialog()
  }

  const status = [
    settings.libraryToken ? "library token set" : "no library token",
    settings.userToken && "user token set",
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`Connection settings (${status})`}
        title={`Connection settings (${status})`}
        className="fixed right-4 bottom-4 size-12 cursor-pointer rounded-full text-xl shadow-md"
      >
        ⚙
      </button>

      <dialog ref={dialogRef} aria-labelledby="connection-dialog-title">
        <h2 id="connection-dialog-title">Connection</h2>
        <p>Status: {status}</p>
        <form key={openCount} onSubmit={handleSubmit}>
          {fields.map((field) => (
            <p key={field.name}>
              <label>
                {field.label}
                <br />
                <input name={field.name} defaultValue={settings[field.name]} size={60} />
              </label>
            </p>
          ))}
          <button type="submit">Save</button>{" "}
          <button type="button" onClick={closeDialog}>
            Cancel
          </button>
        </form>
      </dialog>
    </>
  )
}

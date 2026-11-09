import { type FormEvent } from "react"

import type { ConnectionSettings } from "./connectionSettings"
import { useConnectionSettings } from "./useConnectionSettings"

const fields: { name: keyof ConnectionSettings; label: string }[] = [
  { name: "libraryToken", label: "Library token" },
  { name: "userToken", label: "User token (optional – enables patron data)" },
  { name: "fbiUrl", label: "FBI url" },
  { name: "fbsUrl", label: "FBS url" },
]

/** Where tokens are pasted, like the token stories in react/'s Storybook. */
export const ConnectionPanel = () => {
  const { settings, saveSettings } = useConnectionSettings()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    saveSettings({
      libraryToken: String(formData.get("libraryToken")).trim(),
      userToken: String(formData.get("userToken")).trim(),
      fbiUrl: String(formData.get("fbiUrl")).trim(),
      fbsUrl: String(formData.get("fbsUrl")).trim(),
    })
  }

  return (
    <details open={!settings.libraryToken}>
      <summary>
        Connection: {settings.libraryToken ? "library token set" : "no library token"}
        {settings.userToken ? ", user token set" : ""}
      </summary>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <p key={field.name}>
            <label>
              {field.label}
              <br />
              <input name={field.name} defaultValue={settings[field.name]} size={60} />
            </label>
          </p>
        ))}
        <button type="submit">Save</button>
      </form>
    </details>
  )
}

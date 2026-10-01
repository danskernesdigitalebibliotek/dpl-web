"use client"

import type { WedoBooksSdk, WedoBooksStopReason } from "@danskernesdigitalebibliotek/dpl-wedobooks"
import dynamic from "next/dynamic"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { useReaderSdkSession } from "@/hooks/useReaderSdkSession"
import { generalGoDateFormat } from "@/lib/helpers/helper.dates"

// Loaded on demand like the reader itself: the device list talks to the SDK,
// and importing it statically would link the SDK chunk into every page.
const SdkDeviceSession = dynamic(
  () =>
    import("@danskernesdigitalebibliotek/dpl-wedobooks").then(
      module => module.WedoBooksDeviceSession
    ),
  { ssr: false }
)

export type DigitalSessionModalProps = {
  reason: WedoBooksStopReason
  /**
   * Open the loan again, where the reason allows it. The caller also takes
   * the dialog down: on the read page it is replaced by the reader, from the
   * player bar it is closed through the modal store.
   */
  onRetry: () => void
}

const titleFor = (reason: WedoBooksStopReason) => {
  switch (reason.reason) {
    case "device_limit_reached":
      return "Ikke plads til denne enhed"
    case "open_failed":
      return "Titlen kunne ikke åbnes"
    default:
      return "Titlen blev lukket"
  }
}

const messageFor = (reason: WedoBooksStopReason) => {
  switch (reason.reason) {
    case "taken_over":
      // "On another device" would be wrong for a tab of this same browser.
      return reason.scope === "tab"
        ? "Du har åbnet denne titel i en anden fane."
        : "Du har åbnet denne titel på en anden enhed. Du kan læse eller lytte på én enhed ad gangen."
    case "device_revoked":
      return "Denne enhed er ikke længere registreret på din konto."
    default:
      return "Titlen kunne ikke åbnes. Prøv igen senere."
  }
}

/**
 * The patron's devices, with a way to remove one. Shown when there is no room
 * for this browser: the SDK removes no device on the patron's behalf, so only
 * they can free a place, after which the loan is opened again.
 */
function DeviceLimitReached({ sdk, onRetry }: { sdk: WedoBooksSdk; onRetry: () => void }) {
  return (
    <SdkDeviceSession sdk={sdk}>
      {(devices, removeDevice, removing) =>
        devices && (
          <>
            <p className="text-typo-subtitle-md text-foreground-muted">
              {`Du kan læse og lytte på op til ${devices.limit} enheder, og de er alle i brug. Fjern en for at fortsætte her.`}
            </p>
            <ul className="divide-y">
              {devices.devices.map(device => (
                <li key={device.id} className="flex items-center gap-4 py-2">
                  <span className="flex-1">
                    {device.name}
                    {device.lastUsed && (
                      <span className="text-typo-subtitle-sm text-foreground-muted block">
                        Sidst brugt {generalGoDateFormat(new Date(device.lastUsed))}
                      </span>
                    )}
                  </span>
                  <Button
                    theme="secondary"
                    size="sm"
                    disabled={removing}
                    onClick={() =>
                      removeDevice(device.id).then(removed => {
                        if (removed) onRetry()
                      })
                    }>
                    Fjern
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )
      }
    </SdkDeviceSession>
  )
}

/**
 * What the patron sees when the WeDoBooks SDK will not show a loan. The SDK
 * mounts nothing in that case, so without this the reader page or the player
 * bar would simply be blank. Closing it is the patron's own close.
 *
 * A browser removed from the patron's devices is not a fault - opening again
 * registers it anew - so that one offers to.
 */
function DigitalSessionModal({
  open,
  onClose,
  reason,
  onRetry,
}: DigitalSessionModalProps & { open: boolean; onClose: () => void }) {
  const { data: sdk } = useReaderSdkSession()

  return (
    <ResponsiveDialog open={open} onClose={onClose} title={titleFor(reason)}>
      <div className="w-full space-y-8">
        {reason.reason === "device_limit_reached" ? (
          sdk && <DeviceLimitReached sdk={sdk} onRetry={onRetry} />
        ) : (
          <p className="text-typo-subtitle-md text-foreground-muted">{messageFor(reason)}</p>
        )}
      </div>

      <ResponsiveDialog.Actions>
        {reason.reason === "device_revoked" && (
          <Button theme="secondary" size="lg" onClick={onRetry}>
            Åbn igen
          </Button>
        )}
        <Button theme="primary" size="lg" onClick={onClose}>
          Luk
        </Button>
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default DigitalSessionModal

import * as React from "react"

import {
  removeWedoBooksDevice,
  watchWedoBooksDevices,
  type WedoBooksDevices,
  type WedoBooksSdk,
} from "./sdk"

export interface WedoBooksDeviceSessionProps {
  sdk: WedoBooksSdk
  /**
   * Draws the list. Called with nothing until the SDK has answered, so the
   * caller decides what to show while waiting.
   */
  children: (
    devices: WedoBooksDevices | null,
    removeDevice: (deviceId: string) => Promise<boolean>,
    removing: boolean
  ) => React.ReactNode
}

/**
 * The patron's device list, for the page to draw.
 *
 * A render prop rather than a component with a look of its own: what the list
 * should look like belongs to each app, while following the SDK's stream and
 * removing a device belong here, so neither app imports the SDK for it.
 */
export function WedoBooksDeviceSession({
  sdk,
  children,
}: WedoBooksDeviceSessionProps): React.ReactElement {
  const [devices, setDevices] = React.useState<WedoBooksDevices | null>(null)
  // One removal at a time: it takes a moment, and a second one meanwhile
  // would give up a device the patron did not mean to.
  const [removing, setRemoving] = React.useState(false)

  React.useEffect(() => watchWedoBooksDevices(sdk, setDevices), [sdk])

  const removeDevice = async (deviceId: string) => {
    setRemoving(true)
    try {
      return await removeWedoBooksDevice(sdk, deviceId)
    } finally {
      setRemoving(false)
    }
  }

  return <>{children(devices, removeDevice, removing)}</>
}

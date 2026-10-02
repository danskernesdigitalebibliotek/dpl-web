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
    removeDevice: (deviceId: string) => Promise<boolean>
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

  React.useEffect(() => watchWedoBooksDevices(sdk, setDevices), [sdk])

  const removeDevice = React.useCallback(
    (deviceId: string) => removeWedoBooksDevice(sdk, deviceId),
    [sdk]
  )

  return <>{children(devices, removeDevice)}</>
}

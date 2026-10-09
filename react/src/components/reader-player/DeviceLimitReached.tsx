import React, { Suspense } from "react";
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks";
import { useText } from "../../core/utils/text";
import { formatDate } from "../../core/utils/helpers/date";
import { Button } from "../Buttons/Button";
import DigitalSessionMessage from "./DigitalSessionMessage";

// Loaded on demand like the reader itself: the device list talks to the SDK,
// and importing it statically would link the SDK chunk into the page bundle.
const SdkDeviceSession = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksDeviceSession
  }))
);

export type DeviceLimitReachedProps = {
  sdk: WedoBooksSdk;
  /** A device was removed, so this browser can be registered in its place. */
  onDeviceRemoved: () => void;
  onClose: () => void;
};

/**
 * What the patron sees when the SDK refused to open the loan because their
 * device list is full. Nothing frees a place on its own - the SDK removes no
 * device on the patron's behalf - so the list is shown with a way to remove
 * one, after which the loan is opened again.
 */
const DeviceLimitReached: React.FC<DeviceLimitReachedProps> = ({
  sdk,
  onDeviceRemoved,
  onClose
}) => {
  const t = useText();

  return (
    <Suspense fallback={null}>
      <SdkDeviceSession sdk={sdk}>
        {(devices, removeDevice, removing) =>
          // Nothing to say until the list is in: the message names the limit.
          devices && (
            <DigitalSessionMessage
              text={t("digitalSessionDeviceLimitText", {
                placeholders: { "@limit": devices.limit }
              })}
              onClose={onClose}
            >
              <ul className="my-32">
                {devices.devices.map((device) => (
                  <li key={device.id} className="list-details">
                    <div className="list-details__container">
                      <div>
                        <h3 className="text-header-h5">{device.name}</h3>
                        {device.lastUsed && (
                          <p className="text-small-caption">
                            {t("digitalSessionDeviceLastUsedText", {
                              placeholders: {
                                "@date": formatDate(device.lastUsed)
                              }
                            })}
                          </p>
                        )}
                      </div>
                      <div className="list-details__menu">
                        <Button
                          label={t("digitalSessionRemoveDeviceButtonText")}
                          buttonType="none"
                          collapsible={false}
                          size="small"
                          variant="outline"
                          disabled={removing}
                          onClick={() =>
                            removeDevice(device.id).then((removed) => {
                              if (removed) onDeviceRemoved();
                            })
                          }
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </DigitalSessionMessage>
          )
        }
      </SdkDeviceSession>
    </Suspense>
  );
};

export default DeviceLimitReached;

/**
 * The texts the reader and player pages show when the WeDoBooks SDK will not
 * show the loan - a session that moved, a loan that expired, a full device
 * list, or a refusal we cannot name. In a mounted app they arrive from the CMS as data attributes;
 * see DigitalSessionTexts there for the defaults these mirror.
 */
export const argTypes = {
  digitalSessionTakenOverDeviceText: {
    description: "Shown when the loan was opened on another device",
    control: { type: "text" } as const
  },
  digitalSessionTakenOverTabText: {
    description:
      "Shown when the loan was opened in another tab of this browser",
    control: { type: "text" } as const
  },
  digitalSessionDeviceRevokedText: {
    description: "Shown when this device was removed from the patron's account",
    control: { type: "text" } as const
  },
  digitalSessionAccessExpiredText: {
    description: "Shown when the loan expired while the title was open",
    control: { type: "text" } as const
  },
  digitalSessionDeviceLimitText: {
    description:
      "Shown when the patron has no room for another device. @limit is how many they may have",
    control: { type: "text" } as const
  },
  digitalSessionDeviceLastUsedText: {
    description: "When a listed device last opened content. @date is the day",
    control: { type: "text" } as const
  },
  digitalSessionRemoveDeviceButtonText: {
    description: "Button that removes a listed device",
    control: { type: "text" } as const
  },
  digitalSessionOpenFailedText: {
    description:
      "Shown when the SDK refused to open the loan for a reason we do not name",
    control: { type: "text" } as const
  },
  digitalSessionOpenAgainButtonText: {
    description:
      "Button that opens the loan again after this device was removed",
    control: { type: "text" } as const
  },
  digitalSessionInterruptedCloseButtonText: {
    description: "Button that leaves the reader or player page",
    control: { type: "text" } as const
  }
};

export interface DigitalSessionArgs {
  digitalSessionTakenOverDeviceText: string;
  digitalSessionTakenOverTabText: string;
  digitalSessionDeviceRevokedText: string;
  digitalSessionAccessExpiredText: string;
  digitalSessionDeviceLimitText: string;
  digitalSessionDeviceLastUsedText: string;
  digitalSessionRemoveDeviceButtonText: string;
  digitalSessionOpenFailedText: string;
  digitalSessionOpenAgainButtonText: string;
  digitalSessionInterruptedCloseButtonText: string;
}

const digitalSessionArgs: DigitalSessionArgs = {
  digitalSessionTakenOverDeviceText:
    "You opened this title on another device. You can read or listen on one device at a time.",
  digitalSessionTakenOverTabText:
    "You opened this title in another tab of this browser.",
  digitalSessionDeviceRevokedText:
    "This device is no longer registered to your account.",
  digitalSessionAccessExpiredText:
    "Your loan of this title has expired, so it was closed.",
  digitalSessionDeviceLimitText:
    "You can read and listen on up to @limit devices, and they are all in use. Remove one to continue here.",
  digitalSessionDeviceLastUsedText: "Last used @date",
  digitalSessionRemoveDeviceButtonText: "Remove",
  digitalSessionOpenFailedText:
    "The title could not be opened. Try again later.",
  digitalSessionOpenAgainButtonText: "Open again",
  digitalSessionInterruptedCloseButtonText: "Back"
};

export default digitalSessionArgs;

import type { MaterialType } from "./types"

// Where a digital material is opened - see opensIn.
export type OpensInType = "reader" | "player"

// Every material type that can be opened, and where. Podcast is outside the
// adapter's spec but has been seen on loans.
const OPENS_IN: Record<"ebook" | "audiobook" | "podcast", OpensInType> = {
  ebook: "reader",
  audiobook: "player",
  podcast: "player",
}

/**
 * Whether a material of this type opens in the reader or the player. Null for
 * a type nothing can open: the material is still shown, but must not be
 * offered to read or listen to.
 */
export const opensIn = (materialType: MaterialType): OpensInType | null =>
  Object.hasOwn(OPENS_IN, materialType) ? OPENS_IN[materialType as keyof typeof OPENS_IN] : null

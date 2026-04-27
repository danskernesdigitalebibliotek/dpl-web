import { createSerializer, parseAsJson, parseAsString } from "nuqs"

export type TModalUrlParams = {
  LoanMaterialModal: { wid: string; pid: string }
  PlayerPreviewModal: { wid: string; pid: string }
  PlayerModal: { wid: string; pid: string }
}

export type TModalType = keyof TModalUrlParams

export const VALID_MODAL_TYPES = new Set<string>([
  "LoanMaterialModal",
  "PlayerPreviewModal",
  "PlayerModal",
])

function validateModalProps(value: unknown): TModalUrlParams[TModalType] | null {
  if (typeof value !== "object" || value === null) return null
  const { wid, pid } = value as Record<string, unknown>
  if (typeof wid !== "string" || typeof pid !== "string") return null
  return { wid, pid }
}

export const modalParsers = {
  modal: parseAsString,
  modalProps: parseAsJson(validateModalProps),
}

export const createModalUrl = createSerializer(modalParsers)

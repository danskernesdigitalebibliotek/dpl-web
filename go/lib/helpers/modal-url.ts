import { createSerializer, parseAsJson, parseAsString } from "nuqs"

export type TModalUrlParams = {
  LoanMaterialModal: { wid: string; pid: string }
  LoanLoginModal: { wid: string; pid: string }
  ReservationModal: { wid: string; pid: string }
  ReservationLoginModal: { wid: string; pid: string }
  ReservationUniloginModal: { wid: string; pid: string }
}

export type TModalType = keyof TModalUrlParams

// The URL is a one-shot handover: login redirects land with these params,
// the ModalUrlListener opens the modal through the modal store and strips them.
// Everything else opens through the store directly (see store/modal.store).
export const VALID_MODAL_TYPES = new Set<string>([
  "LoanMaterialModal",
  "LoanLoginModal",
  "ReservationModal",
  "ReservationLoginModal",
  "ReservationUniloginModal",
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

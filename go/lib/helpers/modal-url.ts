const MODAL_PARAM_KEYS = ["modal", "modalProps"] as const

export type TModalUrlParams = {
  LoanMaterialModal: { wid: string; pid: string }
  PlayerPreviewModal: { wid: string; pid: string }
  PlayerModal: { wid: string; pid: string }
}

export type TModalType = keyof TModalUrlParams

const VALID_MODAL_TYPES = new Set<string>(["LoanMaterialModal", "PlayerPreviewModal", "PlayerModal"])

export function buildModalSearchParams(
  existing: URLSearchParams,
  modalType: TModalType,
  params: TModalUrlParams[TModalType]
): URLSearchParams {
  const next = clearModalSearchParams(existing)
  next.set("modal", modalType)
  next.set("modalProps", JSON.stringify(params))
  return next
}

export function clearModalSearchParams(existing: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(existing.toString())
  MODAL_PARAM_KEYS.forEach(key => next.delete(key))
  return next
}

export function parseModalSearchParams(searchParams: URLSearchParams): {
  modalType: TModalType | null
  modalProps: TModalUrlParams[TModalType] | null
} {
  const modal = searchParams.get("modal")
  const modalType = modal && VALID_MODAL_TYPES.has(modal) ? (modal as TModalType) : null

  if (!modalType) return { modalType: null, modalProps: null }

  try {
    const modalProps = JSON.parse(searchParams.get("modalProps") ?? "") as TModalUrlParams[TModalType]
    return { modalType, modalProps }
  } catch {
    return { modalType, modalProps: null }
  }
}

import { useState } from "react"

import { Sheet } from "../../../ui/Sheet"
import { getAccessWayText } from "./articleText"

type DigitalCopyDialogProps = {
  open: boolean
  onClose: () => void
  /** Opens the picker; absent when there is nothing to switch to. */
  onSwitchEdition: (() => void) | undefined
  title: string
  materialType: string
  creators: string
  edition: string
  email: string | undefined
}

const primaryButtonClasses =
  "box-border h-14 min-w-[236px] cursor-pointer appearance-none rounded-xl border border-solid border-black bg-black px-8 font-body text-body-m font-medium tracking-[0.04em] text-white uppercase"

const linkButtonClasses =
  "min-h-11 shrink-0 cursor-pointer border-0 bg-transparent font-body text-[15px] text-text-heading underline underline-offset-4"

/**
 * The prototype's order dialog for "Bestil digital kopi", without placing an
 * order: the PoC runs on real patron tokens, and a concept must not send real
 * orders.
 */
export const DigitalCopyDialog = ({
  open,
  onClose,
  onSwitchEdition,
  title,
  materialType,
  creators,
  edition,
  email,
}: DigitalCopyDialogProps) => {
  const [isOrdered, setIsOrdered] = useState(false)

  const close = () => {
    setIsOrdered(false)
    onClose()
  }

  if (isOrdered) {
    return (
      <Sheet open={open} onClose={close} title="Bestilling sendt" isBare>
        <div aria-live="polite" className="pt-12 pb-6 text-center">
          <h2 className="m-0 font-heading text-[26px] leading-[34px] font-normal">Din bestilling af "{title}" er sendt.</h2>
          <p className="m-0 mt-6 text-body-m">Bestillingen er kun vist i prototypen. Der er ikke sendt nogen bestilling.</p>
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={close} className={primaryButtonClasses}>
              OK
            </button>
          </div>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onClose={close} title="Bestil digital kopi" isBare>
      <div className="pt-2">
        <div className="flex justify-center">
          <div
            aria-hidden="true"
            className="box-border flex h-[180px] w-[136px] flex-col items-center justify-center gap-[18px] border border-solid border-outline bg-white p-[18px] text-center"
          >
            <span className="h-0.5 w-[30px] bg-black" />
            <span className="text-[13px] leading-tight font-semibold">{title}</span>
          </div>
        </div>
        <span className="mt-7 inline-flex h-[26px] items-center border border-solid border-black px-3.5 text-[13px] font-medium tracking-[0.04em]">
          {materialType.toUpperCase()}
        </span>
        <h2 className="m-0 mt-5 font-heading text-[28px] leading-[34px] font-normal">{title}</h2>
        {creators && <p className="m-0 mt-2.5 text-body-m text-text-body">Af {creators}</p>}
        <p className="m-0 mt-7 text-center text-[15px] leading-[22px]">{getAccessWayText({ kind: "digital-copy" })}</p>
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => setIsOrdered(true)} className={primaryButtonClasses}>
            Godkend bestilling
          </button>
        </div>
        <div className="mt-7 flex flex-col gap-2">
          <div className="flex items-center gap-5 rounded-xl bg-white px-5 py-[22px]">
            <div className="min-w-0 grow">
              <p className="m-0 font-heading text-[20px] leading-[26px]">Udgave</p>
              <p className="m-0 mt-0.5 text-body-s leading-5">{edition}</p>
            </div>
            {onSwitchEdition && (
              <button type="button" aria-haspopup="dialog" onClick={onSwitchEdition} className={linkButtonClasses}>
                Skift<span className="sr-only"> udgave</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-5 rounded-xl bg-white px-5 py-[22px]">
            <div className="min-w-0 grow">
              <p className="m-0 font-heading text-[20px] leading-[26px]">Send til</p>
              <p className="m-0 mt-0.5 text-body-s leading-5">{email ?? "Din e-mail"}</p>
            </div>
            {/* A placeholder, as in the prototype. */}
            <button type="button" className={linkButtonClasses}>
              Skift<span className="sr-only"> send til</span>
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}

import { useState } from "react"

import { ActionButton } from "../../../ui/ActionButton"
import { Sheet } from "../../../ui/Sheet"
import { getAccessWayText } from "./articleText"

type DigitalCopyDialogProps = {
  title: string
  email: string | undefined
  open: boolean
  onClose: () => void
}

/**
 * "Bestil digital kopi" without placing an order: the PoC runs on real patron
 * tokens, and a concept must not send real orders.
 */
export const DigitalCopyDialog = ({ title, email, open, onClose }: DigitalCopyDialogProps) => {
  const [isOrdered, setIsOrdered] = useState(false)

  const close = () => {
    setIsOrdered(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Bestil digital kopi"
      subtitle={title}
      footer={
        isOrdered ? (
          <div className="w-40">
            <ActionButton variant="primary" onClick={close}>
              Luk
            </ActionButton>
          </div>
        ) : (
          <>
            <div className="w-40">
              <ActionButton variant="secondary" onClick={close}>
                Annullér
              </ActionButton>
            </div>
            <div className="w-40">
              <ActionButton variant="primary" onClick={() => setIsOrdered(true)}>
                Bestil
              </ActionButton>
            </div>
          </>
        )
      }
    >
      <div className="mx-1 text-body-m text-text-body">
        {isOrdered ? (
          <p className="m-0">Bestillingen er kun vist i prototypen. Der er ikke sendt nogen bestilling.</p>
        ) : (
          <>
            <p className="m-0 mb-3">{getAccessWayText({ kind: "digital-copy" })}</p>
            <p className="m-0">{email ? `Kopien sendes til ${email}.` : "Kopien sendes til din e-mail."}</p>
          </>
        )}
      </div>
    </Sheet>
  )
}

import { type ReactNode, useEffect, useId, useRef } from "react"

type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * The artifacts' modal: a full-height sheet on mobile, a centred 760px dialog
 * from tablet up. Built on <dialog>, so focus handling and Escape come free.
 */
export const Sheet = ({ open, onClose, title, subtitle, children, footer }: SheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-surface-page p-0 font-body text-text-heading backdrop:bg-black/50 md:mx-auto md:mt-[85px] md:h-auto md:max-h-[calc(100vh-133px)] md:w-[760px] md:border md:border-outline-strong"
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <div className="flex shrink-0 items-start gap-4 border-b border-outline bg-surface-card px-5 pt-6 pb-5 md:px-10 md:pt-10 md:pb-7">
          <div className="min-w-0 grow">
            <h2 id={titleId} className="m-0 font-heading text-[26px] leading-[34px] font-normal md:text-h3">
              {title}
            </h2>
            {subtitle && <p className="m-0 mt-1 text-body-s leading-5 text-text-body md:mt-2 md:text-body-m">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Luk"
            onClick={onClose}
            className="-mt-2.5 -mr-2.5 flex size-11 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-2xl text-text-heading"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 grow overflow-y-auto px-4 pt-6 pb-8 md:px-10 md:pt-7 md:pb-10">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-outline-strong bg-surface-card px-4 py-3 md:px-10 md:py-4">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  )
}

import { type ReactNode, useState } from "react"

type AccordionProps = { title: string; subtitle?: string; children: ReactNode }

/** The prototype's collapsible "Udgaver" and "Detaljer" panels. */
export const Accordion = ({ title, subtitle, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <section className="mt-2 rounded-xl border border-solid border-outline bg-white">
      <h2 className="m-0">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
          className="box-border flex min-h-[84px] w-full cursor-pointer items-center gap-5 border-0 bg-transparent px-4 py-3 text-left font-body text-text-heading"
        >
          <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-[#1f2d45]" />
          <span className="flex grow flex-col">
            <span className="text-[20px] leading-7 font-normal">{title}</span>
            {subtitle && <span className="text-[13px] leading-[18px] text-text-inactive">{subtitle}</span>}
          </span>
          <span aria-hidden="true" className={isOpen ? "rotate-180" : undefined}>
            ⌄
          </span>
        </button>
      </h2>
      {isOpen && children}
    </section>
  )
}

import { useState } from "react"

import type { RuleGroup, TraceSection } from "../work/trace"

const storageKey = "work-page-poc:debug-open"

const readIsOpen = () => {
  try {
    return window.sessionStorage.getItem(storageKey) === "true"
  } catch {
    return false
  }
}

type DebugPanelProps = {
  categoryName: string
  sections: TraceSection[]
  rules: RuleGroup[]
  rawData: unknown
}

/**
 * "Hvorfor ser siden sådan ud?": the trace of the decisions behind the page,
 * in a drawer that leaves the page usable, so it follows along as editions
 * change.
 */
export const DebugPanel = ({ categoryName, sections, rules, rawData }: DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(readIsOpen)

  const toggle = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen)
    try {
      window.sessionStorage.setItem(storageKey, String(nextIsOpen))
    } catch {
      // Without storage the panel just doesn't remember being open.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => toggle(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="debug-panel"
        aria-label="Hvorfor ser siden sådan ud?"
        title="Hvorfor ser siden sådan ud?"
        className="fixed right-4 bottom-20 size-12 cursor-pointer rounded-full text-xl font-semibold shadow-md"
      >
        ?
      </button>

      {isOpen && (
        <aside
          id="debug-panel"
          aria-labelledby="debug-panel-title"
          className="fixed top-0 right-0 z-50 box-border h-dvh w-[min(480px,100vw)] overflow-y-auto border-l border-outline bg-surface-card p-5 font-body text-body-s text-text-heading shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="grow">
              <h2 id="debug-panel-title" className="m-0 font-heading text-h5 font-normal">
                Hvorfor ser siden sådan ud?
              </h2>
              <p className="m-0 mt-1 text-text-body">Kategori: {categoryName}</p>
            </div>
            <button
              type="button"
              aria-label="Luk forklaringen"
              onClick={() => toggle(false)}
              className="size-9 shrink-0 cursor-pointer border-0 bg-transparent text-xl"
            >
              ✕
            </button>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="mt-6">
              <h3 className="m-0 border-b border-outline-strong pb-1 font-heading text-body-l font-normal">
                {section.title}
              </h3>
              {section.intro && <p className="m-0 mt-2 text-text-body">{section.intro}</p>}
              <ol className="m-0 mt-2 list-none p-0">
                {section.rows.map((row, index) => (
                  <li key={index} className="border-b border-outline py-2">
                    <p className="m-0 font-semibold">{row.outcome}</p>
                    <code className="mt-1 block text-[13px] leading-5 break-all text-text-heading">{row.input}</code>
                    <p className="m-0 mt-1 text-caption text-text-inactive">{row.rule}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <section className="mt-6">
            <h3 className="m-0 border-b border-outline-strong pb-1 font-heading text-body-l font-normal">
              Regler
            </h3>
            {rules.map((group) => (
              <div key={group.title} className="mt-3">
                <p className="m-0 font-semibold">{group.title}</p>
                <ul className="m-0 mt-1 pl-5">
                  {group.rules.map((rule) => (
                    <li key={rule} className="mb-1">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <details className="mt-6">
            <summary className="cursor-pointer font-heading text-body-l">Rå FBI-data for manifestationen</summary>
            <pre className="m-0 mt-2 overflow-x-auto bg-surface-page p-3 text-[12px] leading-4">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </details>
        </aside>
      )}
    </>
  )
}

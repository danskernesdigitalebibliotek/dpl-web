import { ActionButton } from "../../../ui/ActionButton"
import type { ArticleAction } from "./resolveArticleAction"

type ArticleCallToActionProps = {
  action: ArticleAction | undefined
  printedIssueTo: string | undefined
  texts: string[]
  onOpen: (kind: "read-article" | "digital-copy") => void
}

/** The page's one button, with what happens when it's pressed under it. */
export const ArticleCallToAction = ({ action, printedIssueTo, texts, onOpen }: ArticleCallToActionProps) => {
  const renderButton = () => {
    if (!action) {
      // A placeholder, as in the earlier artifact: the PoC has no library to contact.
      return (
        <ActionButton variant="secondary" onClick={() => {}}>
          Kontakt biblioteket
        </ActionButton>
      )
    }
    const { way, label, isDisabled } = action
    if (isDisabled) {
      return (
        <ActionButton variant="disabled" onClick={() => {}}>
          {label}
        </ActionButton>
      )
    }
    switch (way.kind) {
      case "online":
        return (
          <ActionButton variant="primary" href={way.url}>
            {label}
          </ActionButton>
        )
      case "printed-issue":
        return (
          <ActionButton variant="primary" to={printedIssueTo ?? `/?q=${encodeURIComponent(way.hostTitle)}`}>
            {label}
          </ActionButton>
        )
      default:
        return (
          <ActionButton variant="primary" onClick={() => onOpen(way.kind)}>
            {label}
          </ActionButton>
        )
    }
  }

  return (
    <div className="mt-8 w-full">
      {renderButton()}
      <div aria-live="polite">
        {texts.map((text) => (
          <p key={text} className="m-0 mt-2 text-body-s leading-5 text-[#6b6b6b]">
            {text}
          </p>
        ))}
      </div>
    </div>
  )
}

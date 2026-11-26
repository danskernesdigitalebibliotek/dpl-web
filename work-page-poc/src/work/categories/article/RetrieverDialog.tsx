import { useRetrieverArticle } from "../../../fbi/useRetrieverArticle"
import { Sheet } from "../../../ui/Sheet"

const retrieverErrorTexts: Record<string, string> = {
  BORROWER_NOT_LOGGED_IN: "Du skal være logget ind for at læse artiklen.",
  BORROWER_NOT_IN_MUNICIPALITY: "Artikler kan kun læses og bestilles af lånere, der bor i kommunen.",
  ARTICLE_NOT_FOUND: "Artiklen findes ikke længere.",
}

type RetrieverDialogProps = {
  retrieverId: string
  title: string
  open: boolean
  onClose: () => void
}

/** "Læs artikel": the article from Retriever, read on the page. */
export const RetrieverDialog = ({ retrieverId, title, open, onClose }: RetrieverDialogProps) => {
  const { data, isPending, error } = useRetrieverArticle(retrieverId, open)
  const article = data?.retriever.article
  const retrieverError = data?.retriever.error

  return (
    <Sheet open={open} onClose={onClose} title={article?.headline ?? title} subtitle={article?.sourceName ?? undefined}>
      {open && isPending && <p className="m-0 text-body-m text-text-body">Henter artiklen…</p>}
      {error && <p className="m-0 text-body-m text-text-body">Artiklen kan ikke hentes lige nu.</p>}
      {retrieverError && (
        <p className="m-0 text-body-m text-text-body">
          {retrieverErrorTexts[retrieverError] ?? "Artiklen kan ikke hentes lige nu."}
        </p>
      )}
      {article?.fullTextHtml && (
        <article className="mx-1 text-body-l text-text-body [&_p]:mt-0 [&_p]:mb-4">
          {article.subHeadline && <p className="font-semibold">{article.subHeadline}</p>}
          {/* FBI returns the text as simple HTML; react/ renders it the same way. */}
          <div dangerouslySetInnerHTML={{ __html: article.fullTextHtml }} />
        </article>
      )}
    </Sheet>
  )
}

import { ParagraphGoTextBody } from "@/lib/graphql/generated/dpl-cms/graphql"

type TParagraphGoTextBodyProps = {
  body: ParagraphGoTextBody["body"]
}

const TextBody = (props: TParagraphGoTextBodyProps) => {
  const html = props.body.processed || ""

  if (!html) {
    return null
  }

  return (
    <div className="content-container">
      <div className="max-w-article-max-width mx-auto w-full">
        {/* eslint-disable-next-line react/no-danger */}
        <div className="wysiwyg" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

export default TextBody

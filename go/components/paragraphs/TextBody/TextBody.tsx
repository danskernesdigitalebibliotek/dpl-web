import { ParagraphGoTextBody } from "@/lib/graphql/generated/dpl-cms/graphql"

const TextBody = (props: ParagraphGoTextBody) => {
  const html = props.body.value || ""

  if (!html) {
    return null
  }

  return (
    <div className="content-container">
      <div className="max-w-article-max-width mx-auto w-full">
        <div className="wysiwyg" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

export default TextBody

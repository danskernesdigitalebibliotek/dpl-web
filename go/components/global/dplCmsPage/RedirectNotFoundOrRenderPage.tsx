import { notFound, redirect } from "next/navigation"

import { GetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

export type TRedirectNotFoundOrRenderPageProps = {
  children: React.ReactNode
}

export default function RedirectNotFoundOrRenderPage({
  children,
  data,
  pageType,
}: TRedirectNotFoundOrRenderPageProps & {
  data: GetPageByPathQuery
  pageType: "NodeGoPage" | "NodeGoCategory" | "NodeGoArticle"
}) {
  const routeType = data.route?.__typename

  if (routeType === "RouteRedirect") {
    if (data.route?.url) {
      return redirect(data.route.url)
    }
  }
  if (routeType === "RouteExternal") {
    // TODO: implement external route redirect
    return null
  }
  if (routeType === "RouteInternal") {
    const { entity } = data.route ?? {}
    if (entity?.__typename && entity.__typename === pageType) {
      return <>{children}</>
    }
  }

  return notFound()
}

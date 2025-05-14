import { notFound, redirect } from "next/navigation"
import { expect } from "vitest"

import * as loadArticle from "@/app/(pages)/artikel/[...slug]/loadArticle"
import articlePage from "@/app/(pages)/artikel/[...slug]/page"
import * as loadPageWithCategorySlider from "@/app/(pages-with-category-slider)/[[...slug]]/loadPage"
import categorySliderPage from "@/app/(pages-with-category-slider)/[[...slug]]/page"
import * as loadCategoryPage from "@/app/(pages-with-category-slider)/kategori/[...slug]/loadCategoryPage"
import categoryPage from "@/app/(pages-with-category-slider)/kategori/[...slug]/page"
import {
  GetArticleByPathQuery,
  GetCategoryPageByPathQuery,
  GetPageByPathQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock("@/lib/session/oauth/uniloginClient", () => ({
  getUniloginClientConfig: vi.fn(),
}))

vi.mock("@/app/(pages)/artikel/[...slug]/loadArticle", () => ({
  default: vi.fn(),
}))
vi.mock("@/app/(pages-with-category-slider)/[[...slug]]/loadPage", () => ({
  default: vi.fn(),
}))

const mock = {
  params: { slug: ["test-slug"] },
  data: {
    route: {
      __typename: "RouteRedirect",
      url: "https://example.com",
    },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("Redirecting of dpl-cms pages", () => {
  it("Redirects an article if it has been marked as a redirect'", async () => {
    vi.spyOn(loadArticle, "default").mockResolvedValue(
      Promise.resolve(mock.data) as GetArticleByPathQuery
    )

    await articlePage({ params: Promise.resolve(mock.params) })

    expect(redirect).toHaveBeenCalledWith("https://example.com")
    expect(redirect).toBeCalledTimes(1)
    expect(notFound).not.toHaveBeenCalled()
  })

  it("Redirects an page-with-category-slider if it has been marked as a redirect'", async () => {
    vi.spyOn(loadPageWithCategorySlider, "default").mockResolvedValue(
      Promise.resolve(mock.data) as GetPageByPathQuery
    )

    await categorySliderPage({ params: Promise.resolve(mock.params) })

    expect(redirect).toHaveBeenCalledWith("https://example.com")
    expect(redirect).toBeCalledTimes(1)
    expect(notFound).not.toHaveBeenCalled()
  })

  it("Redirects a category if it has been marked as a redirect'", async () => {
    vi.spyOn(loadCategoryPage, "default").mockResolvedValue(
      Promise.resolve(mock.data) as GetCategoryPageByPathQuery
    )

    await categoryPage({ params: Promise.resolve(mock.params) })

    expect(redirect).toHaveBeenCalledWith("https://example.com")
    expect(redirect).toBeCalledTimes(1)
    expect(notFound).not.toHaveBeenCalled()
  })
})

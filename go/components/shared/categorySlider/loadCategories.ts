import { useGetCategoriesQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadCategories = async () => {
  const data = await useGetCategoriesQuery.fetcher()()

  return data
}

export default loadCategories

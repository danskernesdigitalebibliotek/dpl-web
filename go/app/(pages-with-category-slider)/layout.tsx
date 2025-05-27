import { Suspense } from "react"

import CategorySlider, { TNodeGoCategory } from "@/components/shared/categorySlider/CategorySlider"
import loadCategories from "@/components/shared/categorySlider/loadCategories"
import "@/styles/globals.css"

async function CategorySliderLayout() {
  const data = await loadCategories()
  const categories = data?.goCategories?.results as TNodeGoCategory[] | undefined

  return <CategorySlider categories={categories} />
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen-minus-navigation-height flex h-full w-full flex-col">
      <Suspense>
        <CategorySliderLayout />
      </Suspense>
      <div className="py-space-y">{children}</div>
    </div>
  )
}

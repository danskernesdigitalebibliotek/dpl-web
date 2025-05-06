import CategorySlider, { TNodeGoCategory } from "@/components/shared/categorySlider/CategorySlider"
import loadCategories from "@/components/shared/categorySlider/loadCategories"
import "@/styles/globals.css"

export default async function CategorySliderLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const data = await loadCategories()
  const categories = data?.goCategories?.results as TNodeGoCategory[] | undefined

  return (
    <div className="min-h-screen-minus-navigation-height flex h-full w-full flex-col">
      <CategorySlider categories={categories} />
      <div className="py-space-y">{children}</div>
    </div>
  )
}

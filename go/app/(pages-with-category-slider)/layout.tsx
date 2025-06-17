import CategorySlider from "@/components/shared/categorySlider/CategorySlider"
import "@/styles/globals.css"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen-minus-navigation-height flex flex-col">
      <CategorySlider />
      <div className="py-space-y">{children}</div>
    </div>
  )
}

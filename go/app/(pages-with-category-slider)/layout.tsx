import CategorySlider from "@/components/shared/categorySlider/CategorySlider"
import "@/styles/globals.css"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen-minus-navigation-height flex flex-col">
      <div className="-my-[12px] overflow-hidden lg:-my-[20px]">
        <div className="content-container w-full">
          <div
            className="lg:w-[calc(100%+48px) w-[calc(100%+24px) relative -mx-[24px]
              !overflow-visible px-[12px] lg:-mx-[48px] lg:px-[24px]">
            <CategorySlider />
          </div>
        </div>
      </div>
      <div className="py-space-y">{children}</div>
    </div>
  )
}

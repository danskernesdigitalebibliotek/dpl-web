import ProfilePageLayout from "@/app/user/profile/ProfilePageLayout"
import CategorySliderTrigger from "@/components/shared/categorySliderTrigger/CategorySliderTrigger"

const Page = () => {
  return (
    <>
      <CategorySliderTrigger showCategorySlider={false} />
      <ProfilePageLayout />
    </>
  )
}

export default Page

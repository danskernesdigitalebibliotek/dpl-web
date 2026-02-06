import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

import DefaultLayout from "./(pages)/layout"

const descriptionComponent = <p>Vi kunne desværre ikke finde siden, du leder efter.</p>

export default function NotFound() {
  return (
    <DefaultLayout>
      <ErrorPageLayout
        title="Ups! Noget gik galt."
        description={descriptionComponent}
        buttonText="Gå til forsiden"
        buttonLink="/"
      />
    </DefaultLayout>
  )
}

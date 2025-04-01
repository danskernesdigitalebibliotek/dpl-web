import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

export default function NotFound() {
  return (
    <ErrorPageLayout
      title="Oopsie.."
      description="Vi kan desværre ikke loade siden."
      buttonText="Tilbage til GO! sitet"
      buttonLink="/"
    />
  )
}

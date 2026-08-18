"use client"

// This file has to be the client boundary: MaterialTypeSelectSkeleton comes
// from a module that uses client hooks without declaring "use client" itself,
// so without this the loading.tsx import pulls it into the server graph and the
// build fails.
import { ButtonSkeleton } from "@/components/shared/button/Button"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import { MaterialTypeSelectSkeleton } from "@/components/shared/materialTypeSelect/MaterialTypeSelect"

// The single definition of the work page's loading state, shared by the route's
// loading boundary and by WorkPageLayout while its query resolves. The
// container mirrors WorkPageLayout so the skeleton occupies the same space.
const WorkPageLoading = () => {
  return (
    <div
      className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap"
      role="status">
      <span className="sr-only">Materialet indlæses</span>
      <div className="lg:grid-go mt-5">
        <div className="col-span-4 h-auto lg:order-2">
          <div className="h-auto w-full flex-col items-center justify-center lg:aspect-4/5">
            <CoverPictureSkeleton />
          </div>
          <div className="flex w-full justify-center pt-12">
            <MaterialTypeSelectSkeleton />
          </div>
        </div>
        <div className="pt-grid-gap-3 col-span-4 flex flex-col items-start justify-end lg:pt-0">
          <div className="bg-background-skeleton h-11.5 w-full animate-pulse rounded-md lg:mt-0" />
          <div
            className="mt-grid-gap-2 bg-background-skeleton h-3.25 w-[50%] animate-pulse rounded-md
              lg:mt-7"
          />
        </div>
        <div
          className="mt-grid-gap-3 col-span-4 flex flex-col items-end justify-end lg:order-3
            lg:mt-0">
          <ButtonSkeleton />
          <ButtonSkeleton />
        </div>
      </div>
    </div>
  )
}

export default WorkPageLoading

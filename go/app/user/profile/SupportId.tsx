"use client"

import { cn } from "@/lib/helpers/helper.cn"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

type SupportIdProps = {
  className?: string
}

const SupportId = ({ className }: SupportIdProps) => {
  const { data, isLoading } = useGetV1UserLoans()

  if (isLoading) {
    return <SupportIdSkeleton />
  }

  if (!data?.userData?.friendlyCardNumber) {
    return null
  }

  return (
    <div className={cn("text-typo-subtitle-sm text-foreground/50 col-span-full pb-5", className)}>
      {`Support ID: ${data.userData.friendlyCardNumber}`}
    </div>
  )
}

export const SupportIdSkeleton = ({ className }: SupportIdProps) => (
  <div
    className={cn(
      "bg-background-skeleton mb-5 h-5 w-52 animate-pulse rounded-full pb-5",
      className
    )}
  />
)

export default SupportId

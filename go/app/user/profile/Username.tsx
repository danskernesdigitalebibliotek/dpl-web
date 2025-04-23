"use client"

import useSession from "@/hooks/useSession"
import { cn } from "@/lib/helpers/helper.cn"

type UsernameProps = {
  className?: string
}

export const UsernameSkeleton = ({ className }: UsernameProps) => (
  <div
    className={cn(
      "bg-background-skeleton mb-6 h-10 w-100 animate-pulse rounded-full pb-5",
      className
    )}
  />
)

const Username = ({ className }: UsernameProps) => {
  const { session, isLoading: sessionIsLoading } = useSession()

  if (sessionIsLoading) {
    return <UsernameSkeleton />
  }

  const name = (session?.user?.name || session?.user?.username) ?? null

  if (!name) {
    return null
  }

  return (
    <p
      className={cn(
        "text-typo-heading-2 mt-6 w-full pb-5 lg:order-1 lg:mt-0 lg:w-auto lg:max-w-[80%]",
        className
      )}>
      {name}
    </p>
  )
}
export default Username

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"
import { getEnv } from "@/lib/config/env"

type TFindBookButtonProps = {
  isLoading?: boolean
  onClick?: () => void
}

const className = "min-w-80"
const size = "lg"

const FindBookButton = ({ onClick }: TFindBookButtonProps) => {
  const router = useRouter()
  return (
    <Button
      size={size}
      onClick={() => {
        if (onClick) {
          onClick()
        }
        router.push(`${getEnv("APP_URL")}`)
      }}
      className={className}>
      Find din næste bog
    </Button>
  )
}
export default ButtonWithLoadingStateHoc(FindBookButton, { className, size })

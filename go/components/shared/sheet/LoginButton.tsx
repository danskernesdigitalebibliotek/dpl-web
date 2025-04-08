import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"

type TFindBookButtonProps = {
  isLoading?: boolean
  onClick?: () => void
  url: string
}

const className = "min-w-40"
const theme = "primary"

const LoginButton = ({ onClick, url }: TFindBookButtonProps) => {
  const router = useRouter()

  return (
    <Button
      theme="primary"
      onClick={() => {
        if (onClick) {
          onClick()
        }
        router.push(url)
      }}
      ariaLabel="Log ind">
      LOG IND
    </Button>
  )
}
export default ButtonWithLoadingStateHoc(LoginButton, { className, theme })

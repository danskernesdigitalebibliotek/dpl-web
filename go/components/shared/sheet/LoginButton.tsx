import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"

type TFindBookButtonProps = {
  onClick?: () => void
  url: string
  disabled?: boolean
}

const className = "min-w-40"
const theme = "primary"

const LoginButton = ({ onClick, url, disabled }: TFindBookButtonProps) => {
  const router = useRouter()

  return (
    <Button
      disabled={disabled}
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

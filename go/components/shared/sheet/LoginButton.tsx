import { useRouter } from "next/navigation"

import { Button, ButtonProps } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"

type TFindBookButtonProps = {
  onClick?: () => void
  url: string
} & ButtonProps

const className = "min-w-40"
const theme = "primary"

const LoginButton = ({ onClick, url, ...props }: TFindBookButtonProps) => {
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
      ariaLabel="Log ind"
      {...props}>
      LOG IND
    </Button>
  )
}
export default ButtonWithLoadingStateHoc(LoginButton, { className, theme })

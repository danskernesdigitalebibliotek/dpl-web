import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

export type AlertBoxVariant = "error" | "warning" | "success"

export default function AlertBox({
  message,
  variant = "error",
  icon = "alert",
}: {
  message?: string
  variant?: AlertBoxVariant
  icon?: string
}) {
  return (
    <div
      className={cn("rounded-base mx-auto flex items-center gap-4 p-4", {
        "bg-error-red-100 text-error-red-400": variant === "error",
        "bg-warning-orange-100 text-warning-orange-400": variant === "warning",
        "bg-success-green-100 text-success-green-400": variant === "success",
      })}>
      <Icon className="h-5 min-h-5 w-5 min-w-5" name={icon} />
      <p className="text-typo-link">{message}</p>
    </div>
  )
}

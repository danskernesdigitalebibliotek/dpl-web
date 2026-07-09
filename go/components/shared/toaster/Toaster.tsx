"use client"

import React from "react"
import {
  type ExternalToast,
  Toaster as Sonner,
  type ToasterProps,
  toast as sonnerToast,
} from "sonner"

import Icon from "@/components/shared/icon/Icon"

// Variant colors follow the StatusLabel soft palette and are keyed off
// sonner's data-type attribute — attribute variants outrank the neutral
// base classes, so the winner doesn't depend on stylesheet order.
const Toaster = ({ toastOptions, style, ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    // Widen sonner's 356px default; --width also drives its stacking and
    // swipe geometry, so override the variable rather than the class.
    style={{ "--width": "420px", ...style } as React.CSSProperties}
    // Suppress sonner's built-in type icons; icons are opt-in per toast
    // via the `withIcon` option below.
    icons={{
      info: null,
      warning: null,
      error: null,
      success: null,
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast: `bg-background text-foreground text-typo-link rounded-base flex w-[var(--width)]
          items-center gap-4 px-6 py-5 shadow-[0_0_16px_0_rgba(0,0,0,0.15)]
          data-[type=error]:bg-error-red-100 data-[type=error]:text-error-red-400
          data-[type=success]:bg-success-green-100 data-[type=success]:text-success-green-500
          data-[type=warning]:bg-warning-orange-100 data-[type=warning]:text-warning-orange-400`,
        icon: "shrink-0",
      },
      ...toastOptions,
    }}
    {...props}
  />
)

type ToastType = "info" | "warning" | "error" | "success"

const typeIcons: Record<ToastType, React.ReactNode> = {
  info: <Icon name="info-circle" className="h-6 w-6" />,
  warning: <Icon name="info-circle" className="h-6 w-6" />,
  error: <Icon name="alert" className="h-6 w-6" />,
  success: <Icon name="check" className="h-6 w-6" />,
}

type ToastOptions = ExternalToast & {
  // Toasts render without an icon by default; opt in to the variant's icon.
  withIcon?: boolean
}

const resolveOptions = (
  type: ToastType,
  { withIcon, ...options }: ToastOptions = {}
): ExternalToast => (withIcon ? { icon: typeIcons[type], ...options } : options)

const toast = {
  info: (message: React.ReactNode, options?: ToastOptions) =>
    sonnerToast.info(message, resolveOptions("info", options)),
  warning: (message: React.ReactNode, options?: ToastOptions) =>
    sonnerToast.warning(message, resolveOptions("warning", options)),
  error: (message: React.ReactNode, options?: ToastOptions) =>
    sonnerToast.error(message, resolveOptions("error", options)),
  success: (message: React.ReactNode, options?: ToastOptions) =>
    sonnerToast.success(message, resolveOptions("success", options)),
  dismiss: sonnerToast.dismiss,
}

export { Toaster, toast }

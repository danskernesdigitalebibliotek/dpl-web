"use client"

import { useSelector } from "@xstate/react"
import React, { useEffect, useLayoutEffect, useRef } from "react"

import { sheetStore } from "@/store/sheet.store"

import LoginSheet from "../sheet/LoginSheet"
import SearchFilterSheet from "../sheet/SearchFilterSheet"

export const SheetContentComponentTypes = {
  LoginSheet,
  SearchFilterSheet,
}

export function DynamicSheet() {
  const open = useSelector(sheetStore, state => state.context.open)
  const sheetType = useSelector(sheetStore, state => state.context.sheetType)
  const props = useSelector(sheetStore, state => state.context.props)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the element that triggered the sheet before paint, while
  // document.activeElement still points at the opener button.
  useLayoutEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  // Restore focus after the sheet closes.  The Sheet component (built on
  // Radix Dialog) has no SheetTrigger in the tree, so Radix cannot
  // restore focus on its own.
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  const DynamicSheetContentType =
    SheetContentComponentTypes[sheetType as keyof typeof SheetContentComponentTypes] || null
  if (DynamicSheetContentType === null) return null

  return <DynamicSheetContentType facets={[]} open={open} {...props} />
}

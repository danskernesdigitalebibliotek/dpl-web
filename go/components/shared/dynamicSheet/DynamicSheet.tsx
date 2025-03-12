"use client"

import React from "react"

import { useSheetStore } from "@/store/sheet.store"

import LoginSheet from "../sheet/LoginSheet"
import SearchFilterSheet from "../sheet/SearchFilterSheet"

export const SheetContentComponentTypes = {
  LoginSheet,
  SearchFilterSheet,
}

export function DynamicSheet() {
  const sheetStore = useSheetStore()
  const sheetType = sheetStore.sheetType
  const open = sheetStore.open
  const props = sheetStore.props

  const DynamicSheetContentType =
    SheetContentComponentTypes[sheetType as keyof typeof SheetContentComponentTypes] || null
  if (DynamicSheetContentType === null) return null

  // TODO: figure out how to type props dynamically
  // @ts-ignore
  return <DynamicSheetContentType open={open} {...props} />
}

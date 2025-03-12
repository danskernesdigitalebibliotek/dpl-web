"use client"

import React from "react"

import { useSheetStore } from "@/store/sheet.store"

import LoginSheet from "../sheet/LoginSheet"

export const SheetContentComponentTypes = {
  LoginSheet,
}

export function DynamicSheet() {
  const sheetStore = useSheetStore()
  const sheetType = sheetStore.sheetType
  const open = sheetStore.open

  const DynamicSheetContentType =
    SheetContentComponentTypes[sheetType as keyof typeof SheetContentComponentTypes] || null
  if (DynamicSheetContentType === null) return null

  return <DynamicSheetContentType open={open} />
}

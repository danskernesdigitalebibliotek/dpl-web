"use client"

import { useSelector } from "@xstate/react"
import React from "react"

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

  const DynamicSheetContentType =
    SheetContentComponentTypes[sheetType as keyof typeof SheetContentComponentTypes] || null
  if (DynamicSheetContentType === null) return null

  // TODO: figure out how to type props dynamically
  // @ts-ignore
  return <DynamicSheetContentType open={open} {...props} />
}

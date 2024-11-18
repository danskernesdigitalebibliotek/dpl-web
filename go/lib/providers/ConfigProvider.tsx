"use client"

import { useConfigStore } from "@/store/config.store"

import { UniloginConfiguration } from "../graphql/generated/dpl-cms/graphql"

export default function ConfigProvider({
  children,
  uniloginConfiguration,
}: Readonly<{
  children: React.ReactNode
  uniloginConfiguration: UniloginConfiguration
}>) {
  const useUniloginConfig = useConfigStore(state => state.setUniloginConfig)
  useUniloginConfig(uniloginConfiguration)

  return children
}

import type { Metadata } from "next"
import localFont from "next/font/local"
import { Suspense } from "react"

import Footer from "@/components/global/footer/Footer"
import GridHelper from "@/components/global/gridHelper/GridHelper"
import Header from "@/components/global/header/Header"
import Theme from "@/components/global/theme/Theme"
import { DynamicModal } from "@/components/shared/dynamicModal/DynamicModal"
import { DynamicSheet } from "@/components/shared/dynamicSheet/DynamicSheet"
import { getDplCmsPublicConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { setLayoutMetadata } from "@/lib/helpers/helper.metadata"
import DplCmsConfigContextProvider from "@/lib/providers/DplCmsConfigContextProvider"
import ReactQueryProvider from "@/lib/providers/ReactQueryProvider"
import { CookieInformation } from "@/lib/services/cookieInformation"
import "@/styles/globals.css"

import GlobalErrorBoundary from "./GlobalErrorBoundary"

export const metadata: Metadata = setLayoutMetadata()

// When adding or changing fonts, remember to update the imports in .storybook/preview.tsx
const GTFlexa = localFont({
  src: [
    {
      path: "../public/fonts/GT-Flexa-Expanded-Regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/GT-Flexa-Expanded-Medium.woff2",
      weight: "500",
    },
  ],
  variable: "--font-headline",
  display: "swap",
})

async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const dplCmsConfig = await getDplCmsPublicConfig()
  return (
    <DplCmsConfigContextProvider dplCmsConfig={dplCmsConfig}>
      <Theme>
        <ReactQueryProvider>
          <Header />
          <DynamicSheet />
          <DynamicModal />
          {children}
          <Footer />
        </ReactQueryProvider>
      </Theme>
    </DplCmsConfigContextProvider>
  )
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body className={`${GTFlexa.variable} duration-dark-mode antialiased transition-all`}>
        <CookieInformation />
        <GridHelper hideInProduction />
        <Suspense>
          <RootLayout>
            <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
          </RootLayout>
        </Suspense>
      </body>
    </html>
  )
}

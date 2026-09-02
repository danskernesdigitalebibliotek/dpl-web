import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"

import Footer from "@/components/global/footer/Footer"
import GridHelper from "@/components/global/gridHelper/GridHelper"
import Header from "@/components/global/header/Header"
import MappTracking from "@/components/global/mappTracking/MappTracking"
import Theme from "@/components/global/theme/Theme"
import { DynamicModal } from "@/components/shared/dynamicModal/DynamicModal"
import { DynamicSheet } from "@/components/shared/dynamicSheet/DynamicSheet"
import { Toaster } from "@/components/shared/toaster/Toaster"
import { getDplCmsPublicConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { setLayoutMetadata } from "@/lib/helpers/helper.metadata"
import DplCmsConfigContextProvider from "@/lib/providers/DplCmsConfigContextProvider"
import ReactQueryProvider from "@/lib/providers/ReactQueryProvider"
import ServiceLayerProvider from "@/lib/providers/ServiceLayerProvider"
import "@/styles/globals.css"

import GlobalErrorBoundary from "./GlobalErrorBoundary"

export const metadata: Metadata = setLayoutMetadata()

// When adding or changing fonts, remember to update the imports in .storybook/preview.tsx
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const dplCmsConfig = await getDplCmsPublicConfig()
  return (
    <NuqsAdapter>
      <DplCmsConfigContextProvider dplCmsConfig={dplCmsConfig}>
        <Theme>
          <ReactQueryProvider>
            <ServiceLayerProvider>
              <Header />
              <DynamicSheet />
              <DynamicModal />
              <Toaster />
              {children}
              <Footer />
              {/* Own Suspense boundary: MappTracking reads useSearchParams, which
                would otherwise opt the whole layout into client rendering. */}
              <Suspense>
                <MappTracking />
              </Suspense>
            </ServiceLayerProvider>
          </ReactQueryProvider>
        </Theme>
      </DplCmsConfigContextProvider>
    </NuqsAdapter>
  )
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body className={`${dmSans.variable} duration-dark-mode antialiased transition-all`}>
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

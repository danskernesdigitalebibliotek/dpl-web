import type { Metadata } from "next"
import localFont from "next/font/local"

import Footer from "@/components/global/footer/Footer"
import GridHelper from "@/components/global/gridHelper/GridHelper"
import Header from "@/components/global/header/Header"
import Theme from "@/components/global/theme/Theme"
import { DynamicModal } from "@/components/shared/dynamicModal/DynamicModal"
import { DynamicSheet } from "@/components/shared/dynamicSheet/DynamicSheet"
import { setLayoutMetadata } from "@/lib/helpers/helper.metadata"
import DplCmsConfigContextProviderServer from "@/lib/providers/DplCmsConfigContextProviderServer"
import ReactQueryProvider from "@/lib/providers/ReactQueryProvider"
import "@/styles/globals.css"

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

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body className={`${GTFlexa.variable} duration-dark-mode antialiased transition-all`}>
        <GridHelper hideInProduction />

        <Theme>
          <ReactQueryProvider>
            <DplCmsConfigContextProviderServer>
              <Header />
              <DynamicSheet />
              <DynamicModal />
              {children}
              <Footer />
            </DplCmsConfigContextProviderServer>
          </ReactQueryProvider>
        </Theme>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import localFont from "next/font/local"
import { Suspense } from "react"

import Footer from "@/components/global/footer/Footer"
import GridHelper from "@/components/global/gridHelper/GridHelper"
import Header from "@/components/global/header/Header"
import Theme from "@/components/global/theme/Theme"
import CategorySlider, { TNodeGoCategory } from "@/components/shared/categorySlider/CategorySlider"
import loadCategories from "@/components/shared/categorySlider/loadCategories"
import { DynamicModal } from "@/components/shared/dynamicModal/DynamicModal"
import { DynamicSheet } from "@/components/shared/dynamicSheet/DynamicSheet"
import ReactQueryProvider from "@/lib/providers/ReactQueryProvider"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Børnebiblioteket",
  description: "GO er en digital platform, der giver børn adgang til bøger, lydbøger og e-bøger.",
  icons: [
    { rel: "icon", type: "image/png", url: "/favicon-96x96.png", sizes: "96x96" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
  ],
  manifest: "/site.webmanifest",
}

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const data = await loadCategories()
  const categories = data?.goCategories?.results as TNodeGoCategory[] | undefined

  return (
    <html lang="da">
      <body className={`${GTFlexa.variable} duration-dark-mode antialiased transition-all`}>
        <GridHelper hideInProduction />
        <Theme>
          <ReactQueryProvider>
            <Header />
            <Suspense>
              <CategorySlider categories={categories} />
            </Suspense>
            <DynamicSheet />
            <DynamicModal />
            <div className="min-h-screen-minus-navigation-height py-space-y flex h-full w-full flex-col">
              {children}
            </div>
            <Footer />
          </ReactQueryProvider>
        </Theme>
      </body>
    </html>
  )
}

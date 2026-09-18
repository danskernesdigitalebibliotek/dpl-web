import Footer from "@/components/global/footer/Footer"
import Header from "@/components/global/header/Header"
import "@/styles/globals.css"

export default async function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <div className="min-h-screen-minus-navigation-height py-paragraph-spacing flex flex-col">
        {children}
      </div>
      <Footer />
    </>
  )
}

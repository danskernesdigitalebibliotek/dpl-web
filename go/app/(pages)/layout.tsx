import "@/styles/globals.css"

export default async function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen-minus-navigation-height py-space-y flex h-full w-full flex-col">
      {children}
    </div>
  )
}

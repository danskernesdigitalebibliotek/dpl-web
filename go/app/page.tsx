import goConfig from "@/lib/config/goConfig"

const wellknownUrl = goConfig("service.unilogin.wellknown.url")
export default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <pre>Wellknown url: {wellknownUrl}</pre>
      </main>
    </div>
  )
}

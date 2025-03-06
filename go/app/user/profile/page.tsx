"use client"

import { Suspense } from "react"

import DebuggingSession from "./DebuggingSession"
import LoanList from "./LoanList"
import LogoutButton from "./LogoutButton"

const Page = () => {
  return (
    <div className="content-container grid-go -mt-space-y w-full space-y-3">
      <div className="col-span-full flex flex-row flex-wrap">
        <h1 className="text-typo-subtitle-sm mb-5 lg:w-full">Profile</h1>
        <LogoutButton className="ml-auto justify-end lg:order-2" />
        <p className="text-typo-heading-2 mt-6 w-full pb-5 lg:order-1 lg:mt-0 lg:w-auto lg:max-w-[80%]">
          Username / User Name
        </p>
      </div>
      <LoanList />
      <Suspense fallback={<p>Loading...</p>}>
        <DebuggingSession />
      </Suspense>
    </div>
  )
}

export default Page

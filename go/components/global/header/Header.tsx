import React, { Suspense } from "react"

import { Button } from "@/components/shared/button/Button"
import DarkModeToggle from "@/components/shared/darkModeToggle/DarkModeToggle"
import Icon from "@/components/shared/icon/Icon"
import SearchInput from "@/components/shared/searchInput/SearchInput"
import SmartLink from "@/components/shared/smartLink/SmartLink"

import ProfileButton from "./ProfileButton"

function Header() {
  return (
    <div>
      <div className="flex h-navigation-top-height items-center justify-center bg-background-overlay">
        <p className="text-typo-caption">Biblioterernes ebøger og lydbøger</p>
      </div>
      <div className="content-container grid h-navigation-height grid-cols-3 items-center">
        <div className="flex-0 flex items-center">
          <Button ariaLabel="Gå til forsiden" asChild className="inline-flex px-3">
            <SmartLink href="/" className="inline-flex">
              <Icon name="logo-borderless" />
            </SmartLink>
          </Button>
        </div>
        <div className="flex flex-1 justify-center">
          <DarkModeToggle />
        </div>
        <div className="flex-0 flex justify-end space-x-4 pr-1">
          <Button variant="icon" ariaLabel="Tilgå hjælpesiden">
            <Icon className="h-[24px] w-[24px]" name="question-mark" />
          </Button>
          <Suspense fallback={<p>Loading...</p>}>
            <ProfileButton />
          </Suspense>
        </div>
      </div>
      <div className="h-navigation-search-height">
        <div className="content-container">
          <div className="flex h-full w-full items-center">
            <Suspense fallback={<p>Loading...</p>}>
              <SearchInput placeholder="Søg" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header

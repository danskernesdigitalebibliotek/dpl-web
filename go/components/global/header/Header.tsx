import React, { Suspense } from "react"

import { Button } from "@/components/shared/button/Button"
import DarkModeToggle from "@/components/shared/darkModeToggle/DarkModeToggle"
import Icon from "@/components/shared/icon/Icon"
import SearchInput from "@/components/shared/searchInput/SearchInput"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { cyKeys } from "@/cypress/support/constants"

import LinkToParentLibrary from "./LinkToParentLibrary"
import ProfileButton from "./ProfileButton"

function Header() {
  return (
    <header>
      <div
        className="h-navigation-top-height bg-background-overlay flex items-center justify-center">
        <LinkToParentLibrary />
      </div>
      <div className="content-container h-navigation-height grid grid-cols-3 items-center">
        <div className="flex flex-0 items-center" data-cy={cyKeys["go-logo"]}>
          <Button ariaLabel="Gå til forsiden" asChild className="inline-flex px-3">
            <SmartLink href="/" className="inline-flex">
              <Icon name="logo-borderless" />
            </SmartLink>
          </Button>
        </div>
        <div className="flex flex-1 justify-center">
          <DarkModeToggle />
        </div>
        <div className="flex flex-0 justify-end gap-x-4">
          <ProfileButton />
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
    </header>
  )
}

export default Header

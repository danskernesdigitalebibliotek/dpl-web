import React from "react";

import { Button } from "@/components/shared/button/Button";
import DarkModeToggle from "@/components/shared/darkModeToggle/DarkModeToggle";
import Icon from "@/components/shared/icon/Icon";
import { SearchInput } from "@/components/shared/searchInput/SearchInput";

function Header() {
  return (
    <div>
      <div className="bg-background-foreground dark-mode-transition flex items-center justify-center h-navigation-top-height">
        <p>Biblioterernes ebøger og lyderbøger</p>
      </div>
      <div className="h-navigation-height grid grid-cols-3 items-center content-container ">
        <div className="flex-0">
          <Icon className="h-[40px]" name="logo" />
        </div>
        <div className="flex justify-center flex-1">
          <DarkModeToggle />
        </div>
        <div className="flex justify-end space-x-4 flex-0">
          <Button variant="icon">
            <Icon className="w-[24px] h-[24px]" name="question-mark" />
          </Button>
          <Button variant="icon">
            <Icon className="w-[24px] h-[24px]" name="search" />
          </Button>
        </div>
      </div>
      <div className=" h-navigation-search-height">
        <div className="content-container">
          <div className="flex items-center h-full w-full">
            <SearchInput />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;

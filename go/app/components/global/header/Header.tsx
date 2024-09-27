import React from "react";

import DarkModeToggle from "@/app/components/shared/darkModeToggle/DarkModeToggle";
import Icon from "@/app/components/shared/icon/Icon";

function Header() {
  return (
    <div>
      <div className="bg-background-foreground dark-mode-transition flex items-center justify-center h-navigation-top-height">
        <p>Biblioterernes ebøger og lyderbøger</p>
      </div>
      <div className="h-navigation-height grid grid-cols-3 items-center content-container ">
        <Icon name="logo" />
        <div className="flex justify-center">
          <DarkModeToggle />
        </div>
      </div>
      <div className="bg-slate-500 h-navigation-search-height"></div>
    </div>
  );
}

export default Header;

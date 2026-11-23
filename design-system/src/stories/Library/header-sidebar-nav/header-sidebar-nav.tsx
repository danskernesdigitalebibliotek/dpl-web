import { useEffect } from "react";
import { ReactComponent as CloseSidebarIcon } from "../Icons/icon-close-large/icon-close-large.svg";
import { MenuItemsProps } from "../header-menu-list/HeaderMenuListData";
import MenuItemList from "../header-menu-list/HeaderMenuList";

export type HeaderSidebarNavProps = {
  menuLinks: MenuItemsProps[];
};

const HeaderSidebarNav: React.FC<HeaderSidebarNavProps> = ({ menuLinks }) => {
  useEffect(() => {
    require("./header-sidebar-nav-js");
  }, []);

  return (
    <dialog className="header-sidebar-nav" id="sidebarNav" aria-label="Menu">
      <div className="header-sidebar-nav__background-wrapper">
        <div className="header-sidebar-nav__menu-wrapper">
          <button
            type="button"
            className="header-sidebar-nav__close-menu-button"
            id="js-header-sidebar-nav__close-menu-button"
            aria-label="Close menu"
          >
            <CloseSidebarIcon aria-hidden="true" />
          </button>
          <nav aria-label="Sidebar site navigation">
            <MenuItemList menuItems={menuLinks} />
          </nav>
        </div>
      </div>
    </dialog>
  );
};

export default HeaderSidebarNav;

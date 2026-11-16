import { useEffect, useRef } from "react";
import { ReactComponent as CloseSidebarIcon } from "../Icons/icon-close-large/icon-close-large.svg";
import { MenuItemsProps } from "../header-menu-list/HeaderMenuListData";
import MenuItemList from "../header-menu-list/HeaderMenuList";

export type HeaderSidebarNavProps = {
  menuLinks: MenuItemsProps[];
  menuOpen?: "open" | "closed";
};

const HeaderSidebarNav: React.FC<HeaderSidebarNavProps> = ({
  menuLinks,
  menuOpen = "closed",
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    require("./header-sidebar-nav-js");
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (menuOpen === "open" && !dialog.open) {
      dialog.showModal();
    }
    if (menuOpen === "closed" && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="header-sidebar-nav"
      id="sidebarNav"
      aria-label="Menu"
    >
      <div className="header-sidebar-nav__background-wrapper">
        <div className="header-sidebar-nav__menu-wrapper">
          <button
            type="button"
            className="btn-ui header-sidebar-nav__close-menu-button"
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
